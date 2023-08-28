const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const { body, validationResult } = require('express-validator');
const methodOverride = require('method-override');

//  DB CONNECT
require('./utils/db');
// Model
const { Contact, ObjectId } = require('./model/contact');

// Session,  flash
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(expressLayouts);

// Setting suatu direktori jadi public. Disini nama directorynya adalah public
app.use(express.static('public'));
// Supaya method post bisa digunakan
app.use(express.urlencoded({ extended: true }));

// method override
app.use(methodOverride('_method'));

// Konfigurasi Flash
app.use(cookieParser('secret'));
app.use(session({
  cookie: {maxAge: 6000},
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));
app.use(flash());

app.get('/', (req, res) => {  
  res.render('index', {
    layout: 'layouts/main-layout',
    title: 'Home',
    page: 'Halaman Utama'
  });
});

app.get('/contact', async (req, res) => {
  const contacts = await Contact.find();

  res.render('contact', {
    layout: 'layouts/main-layout',
    title: 'Kontak',    
    page: 'List Kontak',
    contacts,
    msg: req.flash('msg')
  });
});

app.post('/contact', 
  [
    body('name')
      .trim()
      // validasi dengan custom message
      .notEmpty().withMessage('Nama tak boleh kosong')
      // Custom validasi
      .custom(async name => {
        const isDuplicate = await Contact.findOne({ name });
        if (isDuplicate) {
          throw new Error('Nama sudah digunakan');
        }
        return true;
      }),
    body('email')
      .trim()
      .notEmpty().withMessage('Email tak boleh kosong')
      .isEmail().withMessage('Format email salah'),
    body('nohp')
      .trim()
      .notEmpty().withMessage('Nomor HP tak boleh kosong')
      .isNumeric().withMessage('Nomor HP harus berupa angka')
      .isMobilePhone('id-ID').withMessage('Format Nomor HP salah')
  ],
  async (req, res) => {
    const errors = validationResult(req);

    // Erors kosong, maka tidka ada error
    if (errors.isEmpty()) {
      new Contact(req.body).save().then(result => {
        req.flash('msg', 'Data kontak berhasil ditambahkan');
        res.redirect('/contact');        
      });      
      return;
    }    

    res.render('contact-add', {
      layout: 'layouts/main-layout',
      title: 'Add Contact',    
      page: 'Form Tambah Kontak',
      errors: errors.array()
    });      
  }
);

app.delete('/contact', (req, res) => {  
  Contact.deleteOne({ name: req.body.name })
    .then(result => {
      req.flash('msg', 'Kontak berhasil dihapus');
    })
    .catch(error => {
      req.flash('msg', 'Kontak yang dimaksud tidak ditemukan');
    })
    .finally(() => {
      res.redirect('/contact');
    });

});

// Edit kontak
app.put('/contact', 
  [
    body('name')
      .trim()
      // validasi dengan custom message
      .notEmpty().withMessage('Nama tak boleh kosong')
      // Custom validasi
      .custom(async (name, { req }) => {
        const isDuplicate = await Contact.findOne({ name });
        if (name !== req.body.oldName && isDuplicate) {
          throw new Error('Nama sudah digunakan');
        }
        return true;
      }),
    body('email')
      .trim()
      .notEmpty().withMessage('Email tak boleh kosong')
      .isEmail().withMessage('Format email salah'),
    body('nohp')
      .trim()
      .notEmpty().withMessage('Nomor HP tak boleh kosong')
      .isNumeric().withMessage('Nomor HP harus berupa angka')
      .isMobilePhone('id-ID').withMessage('Format Nomor HP salah')
  ],
  (req, res) => {
    const errors = validationResult(req);

    if (errors.isEmpty()) {
      Contact.updateOne(
        { _id: new ObjectId(req.body._id) },
        {
          $set: { 
            name: req.body.name,
            email: req.body.email,
            nohp: req.body.nohp            
          },
          $currentDate: { lastModified: true }
        }
      ).then(result => {
        req.flash('msg', 'Data kontak berhasil diedit');
        res.redirect('/contact');
      });
      return;
    }    
    
    req.flash('msg', errors.array());
    res.redirect(`/contact/edit/${req.body.oldName}`);
  }
);

app.get('/contact/edit/:name', async (req, res) => {
  const contact = await Contact.findOne({ name: req.params.name });
  
  res.render('contact-edit', {
    layout: 'layouts/main-layout',
    title: 'Edit Contact',
    page: 'Form Edit Kontak',
    contact,
    errors: req.flash('msg')
  });
});

app.get('/contact/add', (req, res) => {
  res.render('contact-add', {
    layout: 'layouts/main-layout',
    title: 'Add Contact',    
    page: 'Form Tambah Kontak',     
    errors: ''
  });
});

app.get('/contact/:name', async (req, res) => {
  const productName = req.params.name;
  const contact = await Contact.findOne({ name: productName });

  res.render('detail', {
    layout: 'layouts/main-layout',
    title: `Detail ${productName}`,    
    page: `Detail Kontak ${productName}`,
    contact
  })
});

app.get('/product', (req, res) => {
  res.render('product', {
    layout: 'layouts/main-layout',
    title: 'Produk',
    page: 'Produk'
  });
});

app.get('/about', (req, res) => {
  res.render('about', {
    // layout: 'layouts/main-layout',
    title: 'About',
    page: 'About'
  });
});

// Middleware
app.use('/', (req, res, next) => {
  res.status(404)
  res.send(`<h1>404</h1>`);
});

// port dijalankannya server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});