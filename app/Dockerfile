FROM node:14.5-stretch
MAINTAINER Marcelo Duarte Trevisani

WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH

COPY package.json ./
COPY package-lock.json ./

RUN apt-get update -qq && apt-get install -y build-essential

RUN npm install sass-loader
RUN npm install react-scripts@3.4.1 -g
RUN npm install react
RUN npm install


COPY . ./
