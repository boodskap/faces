FROM jjanzic/docker-python3-opencv
LABEL maintainer="Jegan Vincent <platform@boodskap.io>"
RUN curl -sL https://deb.nodesource.com/setup_10.x | bash -
RUN apt-get -y update && apt-get install -y sudo nginx nodejs npm software-properties-common
RUN npm install pm2 -g
RUN apt-get clean && apt-get autoclean && apt-get autoremove
ADD . /faces
WORKDIR /faces
RUN cp ./files/localhost /etc/nginx/sites-enabled/
RUN pip3 install -r requirements.txt
RUN mkdir tmp
RUN git clone https://github.com/cjlin1/libsvm.git
WORKDIR /faces/libsvm
RUN make clean all
WORKDIR /faces/libsvm/python
RUN make
WORKDIR /faces/libsvm
RUN cp libsvm* /
WORKDIR /faces/ui
RUN npm install
EXPOSE 80 5000 5001
CMD [ "/faces/bin/run.sh" ]
