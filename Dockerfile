FROM jjanzic/docker-python3-opencv
LABEL maintainer="Jegan Vincent <platform@boodskap.io>"
RUN curl -sL https://deb.nodesource.com/setup_10.x | bash -
RUN apt-get -y update && apt-get install -y sudo nodejs npm software-properties-common
RUN npm install pm2 -g
RUN apt-get clean && apt-get autoclean && apt-get autoremove
ADD . /faces
WORKDIR /faces
RUN pip3 install -r requirements.txt
RUN mkdir tmp
RUN git clone https://github.com/cjlin1/libsvm.git
WORKDIR /faces/libsvm
RUN make clean all
WORKDIR /faces/libsvm/python
RUN make
WORKDIR /faces/libsvm
RUN cp libsvm* /
WORKDIR /faces
EXPOSE 5000
CMD [ "python3", "./service.py" ]
