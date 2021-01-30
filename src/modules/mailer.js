
const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');

const {host, port, user, pass} = require('../config/mail.json');

const transport = nodemailer.createTransport({
  host,
  port,
  auth: { user, pass },
});

transport.use(
  'compile',
  hbs({
      viewEngine: {
          extName: '.hbs',
          partialsDir: './resourse/mail/auth', 
          layoutsDir: './resourse/mail/auth',
          defaultLayout: '',
      },
      extName: '.hbs',
      viewPath: './resourse/mail/auth',
  })
)

module.exports = transport;