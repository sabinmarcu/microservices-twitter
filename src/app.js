import twitter from './twitter';

twitter.get('friends/list', { screen_name: process.argv[2] }, (err, tweets) => {
  if (err) {
    console.log('Error');
    console.log(err);
  } else {
    console.log(tweets);
  }
});
