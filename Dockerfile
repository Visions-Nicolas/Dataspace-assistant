FROM node:lts

#pnpm
RUN npm install -g pnpm

#/usr/src/app as workdir
WORKDIR /usr/src/app

#clone repo
RUN git clone https://github.com/Visions-Nicolas/Dataspace-assistant.git .

#install dependency with --unsafe-perm to avoid bcrypt error
RUN npm install --unsafe-perm

#Command to run the application
CMD ["sh", "-c", "pnpm run build && pnpm run start"]
