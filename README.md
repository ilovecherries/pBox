# pBox
---
## requirements
- node.js with npm

## running pBox

as of right now, there is no docker provided to run it conveniently. one will
be provided as soon as it's in a somewhat usable and stable state. for
development, you can do the following to get it running.

1. clone the repo to a folder.
2. install the packages.
```sh
npm install
```
3. use the ORM tool to create a database and client for the code.
```sh
# setup the database
npx prisma migrate dev
# generate the client for the ORM to interact with the database
npx prisma generate
```
4. now you can start running the server.
```sh
npm run dev
``` 

I won't provide more information, I just figured it's necessary that it's
available in some capacity.