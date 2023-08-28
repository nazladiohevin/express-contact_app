const {mongoose} = require('mongoose');

const dbName = 'campus';
mongoose.connect(`mongodb://127.0.0.1:27017/${dbName}`);

// Schema
// Jika collection sudah ada
// const Mahasiswa = mongoose.model('Mahasiswa', {
//   name: {
//     type: String,
//     required: true
//   },
//   email: {
//     type: String,
//     required: true
//   },
//   nohp: {
//     type: String,
//     required: true
//   }
// }, 'mahasiswa');

// const Contact = mongoose.model('Contact', {
//   name: {
//     type: String,
//     required: true
//   },
//   email: {
//     type: String,
//     required: true
//   },
//   nohp: {
//     type: String,
//     required: true
//   }
// }, 'contacts');

// const contact1 = new Contact(
//   { 
//     name: 'Gibran',
//     email: 'gibran@gmail.com',
//     nohp: '087656454323'
//   }
// );

// contact1.save().then(console.log);