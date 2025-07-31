var mongoose = require('mongoose');
mongoose.connect('mongodb+srv://grh991221:AaKU8nle060TcZRs@cluster0.diduzgp.mongodb.net/mall').then(() => {
  console.log('MongoDB connected successfully');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

// 