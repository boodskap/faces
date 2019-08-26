import cv2
import numpy as np
import math as m
from scipy.special import gamma as tgamma
import svmutil
from svmutil import *
import json
from flask import Flask, request
import argparse
import uuid
import os
import base64

app = Flask(__name__)

model = svmutil.svm_load_model("files/allmodel")
cascades = {
    'ff': cv2.CascadeClassifier("files/haarcascade_frontalface_default.xml"),
    'up': cv2.CascadeClassifier("files/haarcascade_upperbody.xml"),
    'mup': cv2.CascadeClassifier("files/haarcascade_mcs_upperbody.xml"),
    'pp': cv2.CascadeClassifier("files/haarcascade_profileface.xml")
}


# AGGD fit model, takes input as the MSCN Image / Pair-wise Product
def AGGDfit(structdis):
    # variables to count positive pixels / negative pixels and their squared sum

    poscount = len(structdis[structdis > 0])  # number of positive pixels
    negcount = len(structdis[structdis < 0])  # number of negative pixels

    # calculate squared sum of positive pixels and negative pixels
    possqsum = np.sum(np.power(structdis[structdis > 0], 2))
    negsqsum = np.sum(np.power(structdis[structdis < 0], 2))

    # absolute squared sum
    abssum = np.sum(structdis[structdis > 0]) + np.sum(-1 * structdis[structdis < 0])

    # calculate left sigma variance and right sigma variance
    lsigma_best = np.sqrt((negsqsum / negcount))
    rsigma_best = np.sqrt((possqsum / poscount))

    gammahat = lsigma_best / rsigma_best

    # total number of pixels - totalcount
    totalcount = structdis.shape[1] * structdis.shape[0]

    rhat = m.pow(abssum / totalcount, 2) / ((negsqsum + possqsum) / totalcount)
    rhatnorm = rhat * (m.pow(gammahat, 3) + 1) * (gammahat + 1) / (m.pow(m.pow(gammahat, 2) + 1, 2))

    prevgamma = 0
    prevdiff = 1e10
    sampling = 0.001
    gam = 0.2

    # vectorized function call for best fitting parameters
    vectfunc = np.vectorize(func, otypes=[np.float], cache=False)

    # calculate best fit params
    gamma_best = vectfunc(gam, prevgamma, prevdiff, sampling, rhatnorm)

    return [lsigma_best, rsigma_best, gamma_best]


def func(gam, prevgamma, prevdiff, sampling, rhatnorm):
    while (gam < 10):
        r_gam = tgamma(2 / gam) * tgamma(2 / gam) / (tgamma(1 / gam) * tgamma(3 / gam))
        diff = abs(r_gam - rhatnorm)
        if (diff > prevdiff): break
        prevdiff = diff
        prevgamma = gam
        gam += sampling
    gamma_best = prevgamma
    return gamma_best


def compute_features(img):
    scalenum = 2
    feat = []
    # make a copy of the image
    im_original = img.copy()

    # scale the images twice
    for itr_scale in range(scalenum):
        im = im_original.copy()
        # normalize the image
        im = im / 255.0

        # calculating MSCN coefficients
        mu = cv2.GaussianBlur(im, (7, 7), 1.166)
        mu_sq = mu * mu
        sigma = cv2.GaussianBlur(im * im, (7, 7), 1.166)
        sigma = (sigma - mu_sq) ** 0.5

        # structdis is the MSCN image
        structdis = im - mu
        structdis /= (sigma + 1.0 / 255)

        # calculate best fitted parameters from MSCN image
        best_fit_params = AGGDfit(structdis)
        # unwrap the best fit parameters
        lsigma_best = best_fit_params[0]
        rsigma_best = best_fit_params[1]
        gamma_best = best_fit_params[2]

        # append the best fit parameters for MSCN image
        feat.append(gamma_best)
        feat.append((lsigma_best * lsigma_best + rsigma_best * rsigma_best) / 2)

        # shifting indices for creating pair-wise products
        shifts = [[0, 1], [1, 0], [1, 1], [-1, 1]]  # H V D1 D2

        for itr_shift in range(1, len(shifts) + 1):
            OrigArr = structdis
            reqshift = shifts[itr_shift - 1]  # shifting index

            # create transformation matrix for warpAffine function
            M = np.float32([[1, 0, reqshift[1]], [0, 1, reqshift[0]]])
            ShiftArr = cv2.warpAffine(OrigArr, M, (structdis.shape[1], structdis.shape[0]))

            Shifted_new_structdis = ShiftArr
            Shifted_new_structdis = Shifted_new_structdis * structdis
            # shifted_new_structdis is the pairwise product
            # best fit the pairwise product
            best_fit_params = AGGDfit(Shifted_new_structdis)
            lsigma_best = best_fit_params[0]
            rsigma_best = best_fit_params[1]
            gamma_best = best_fit_params[2]

            constant = m.pow(tgamma(1 / gamma_best), 0.5) / m.pow(tgamma(3 / gamma_best), 0.5)
            meanparam = (rsigma_best - lsigma_best) * (tgamma(2 / gamma_best) / tgamma(1 / gamma_best)) * constant

            # append the best fit calculated parameters
            feat.append(gamma_best)  # gamma best
            feat.append(meanparam)  # mean shape
            feat.append(m.pow(lsigma_best, 2))  # left variance square
            feat.append(m.pow(rsigma_best, 2))  # right variance square

        # resize the image on next iteration
        im_original = cv2.resize(im_original, (0, 0), fx=0.5, fy=0.5, interpolation=cv2.INTER_CUBIC)
    return feat


# function to calculate BRISQUE quality score
# takes input of the image path
def test_measure_BRISQUE(dis):
    # read image from given path
    if dis is None:
        print("Wrong image path given")
        print("Exiting...")
        sys.exit(0)
    # convert to gray scale
    dis = cv2.cvtColor(dis, cv2.COLOR_BGR2GRAY)

    # compute feature vectors of the image
    features = compute_features(dis)

    # rescale the brisqueFeatures vector from -1 to 1
    x = [0]

    # pre loaded lists from C++ Module to rescale brisquefeatures vector to [-1, 1]
    min_ = [0.336999, 0.019667, 0.230000, -0.125959, 0.000167, 0.000616, 0.231000, -0.125873, 0.000165, 0.000600,
            0.241000, -0.128814, 0.000179, 0.000386, 0.243000, -0.133080, 0.000182, 0.000421, 0.436998, 0.016929,
            0.247000, -0.200231, 0.000104, 0.000834, 0.257000, -0.200017, 0.000112, 0.000876, 0.257000, -0.155072,
            0.000112, 0.000356, 0.258000, -0.154374, 0.000117, 0.000351]

    max_ = [9.999411, 0.807472, 1.644021, 0.202917, 0.712384, 0.468672, 1.644021, 0.169548, 0.713132, 0.467896,
            1.553016, 0.101368, 0.687324, 0.533087, 1.554016, 0.101000, 0.689177, 0.533133, 3.639918, 0.800955,
            1.096995, 0.175286, 0.755547, 0.399270, 1.095995, 0.155928, 0.751488, 0.402398, 1.041992, 0.093209,
            0.623516, 0.532925, 1.042992, 0.093714, 0.621958, 0.534484]

    # append the rescaled vector to x
    for i in range(0, 36):
        min = min_[i]
        max = max_[i]
        x.append(-1 + (2.0 / (max - min) * (features[i] - min)))

    # load model

    # create svm node array from python list
    x, idx = gen_svm_nodearray(x[1:], isKernel=(model.param.kernel_type == PRECOMPUTED))
    x[36].index = -1  # set last index to -1 to indicate the end.

    # get important parameters from model
    svm_type = model.get_svm_type()
    is_prob_model = model.is_probability_model()
    nr_class = model.get_nr_class()

    if svm_type in (ONE_CLASS, EPSILON_SVR, NU_SVC):
        # here svm_type is EPSILON_SVR as it's regression problem
        nr_classifier = 1
    dec_values = (c_double * nr_classifier)()

    # calculate the quality score of the image using the model and svm_node_array
    qualityscore = svmutil.libsvm.svm_predict_probability(model, x, dec_values)

    return qualityscore


def detect_faces(model, image):
    # Read the image
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Detect faces in the image
    faces = cascades[model].detectMultiScale(
        gray,
        scaleFactor=1.1,
        minNeighbors=5,
        minSize=(30, 30),
        flags=cv2.CASCADE_SCALE_IMAGE
    )

    return faces


@app.route('/detect', methods=['POST'])
def do_detection():
    mname = request.args.get("model", "ff")
    padx = request.args.get("px", 0, type=int)
    pady = request.args.get("py", 0, type=int)
    padex = request.args.get("pw", 0, type=int)
    padey = request.args.get("ph", 0, type=int)
    file = request.files['file']
    uid = uuid.uuid1()
    impath = "tmp/" + uid.hex + file.filename
    file.save(impath)
    image = cv2.imread(impath)
    height, width, channels = image.shape

    print("Predicting image {} ".format(impath))

    quality = (100 - test_measure_BRISQUE(image))
    faces = detect_faces(mname, image)
    boxes = []

    for (x, y, w, h) in faces:
        px = int(x - padx)
        py = int(y - pady)
        pex = int(x + w + padex)
        pey = int(y + h + padey)
        if px < 0:
            px = 0
        if py < 0:
            py = 0
        if pex > width:
            pex = width
        if pey > height:
            pey = height
        box = {"x": px, "y": py, "ex": pex, "ey": pey}
        boxes.append(box)

    result = {
        "quality": quality,
        "faces": len(faces),
        "boxes": boxes
    }

    os.remove(impath)

    return json.dumps(result), 200, {'content-type': 'application/json'}


@app.route('/cropdetect', methods=['POST'])
def do_crop_detection():
    mname = request.args.get("model", "ff")
    padx = request.args.get("px", 0, type=int)
    pady = request.args.get("py", 0, type=int)
    padex = request.args.get("pw", 0, type=int)
    padey = request.args.get("ph", 0, type=int)
    file = request.files['file']
    uid = uuid.uuid1()
    impath = "tmp/" + uid.hex + file.filename
    file.save(impath)
    image = cv2.imread(impath)
    height, width, channels = image.shape

    print("Predicting image {} ".format(impath))

    quality = (100 - test_measure_BRISQUE(image))
    faces = detect_faces(mname, image)
    boxes = []
    regions = []

    for (x, y, w, h) in faces:
        px = int(x - padx)
        py = int(y - pady)
        pex = int(x + w + padex)
        pey = int(y + h + padey)
        if px < 0:
            px = 0
        if py < 0:
            py = 0
        if pex > width:
            pex = width
        if pey > height:
            pey = height
        box = {"x": px, "y": py, "ex": pex, "ey": pey}
        roi = image[py:pey, px:pex]
        fpath = "tmp/" + uid.hex + ".jpg"
        cv2.imwrite(fpath, roi)
        with open(fpath, "rb") as imageFile:
            encoded = base64.b64encode(imageFile.read()).decode('ascii')
            regions.append(encoded)
            os.remove(fpath)
        boxes.append(box)

    result = {
        "quality": quality,
        "faces": len(faces),
        "boxes": boxes,
        "regions": regions
    }

    os.remove(impath)

    return json.dumps(result), 200, {'content-type': 'application/json'}


ap = argparse.ArgumentParser()
ap.add_argument('-lh', '--host', required=False, help='listen_host [0.0.0.0]')
ap.add_argument('-lp', '--port', required=False, help='listen_port 5000')
args = ap.parse_args()

listen_host = '0.0.0.0'
listen_port = 5000

if args.host is not None:
    listen_host = str(args.host)
if args.port is not None:
    listen_port = int(args.port)

app.run(host=listen_host, port=listen_port)
