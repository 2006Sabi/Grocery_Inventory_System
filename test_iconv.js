try {
  const iconv = require('iconv-lite');
  const buf = iconv.encode('hello', 'win1251');
  console.log('Iconv-lite is working! Buffer:', buf);
} catch (error) {
  console.error('Iconv-lite test failed:', error);
}
