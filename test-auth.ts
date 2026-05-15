class Test {
  apiUrl = 'http://test.com';
  baseUrl = `${this.apiUrl}/auth`;
}
console.log(new Test().baseUrl);
