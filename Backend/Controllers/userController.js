exports.getUserProfile = (req, res) => {
    res.json({ message: 'User profile route works!' });
  };
  
  exports.addFavorite = (req, res) => {
  console.log('addFavorite called');
  console.log('Request body:', req.body);
  console.log('Authenticated user:', req.user);
    // Add logic to add a favorite here
    res.json({ message: 'Add favorite route works!' });
  };
  
  exports.removeFavorite = (req, res) => {
    // Add logic to remove a favorite here
    res.json({ message: 'Remove favorite route works!' });
  };
  