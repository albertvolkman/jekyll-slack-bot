module.exports = values => {
  return new Promise(function(resolve, reject) {
    let date = new Date();
    let output = '';
    let default_values = [
      {
        key: 'layout',
        value: 'message'
      },
      {
        key: 'permalink',
        value: '/messages/:year/:month/:day/'
      },
      {
        key: 'date',
        value: date.getFullYear() + '-' + ('0' + date.getMonth()).slice(-2) + '-' + ('0' + date.getDate()).slice(-2) + ' 10:00:00 -0400',
      }
    ];

    let front_matter = values.concat(default_values);

    output = "---\n";
    output += front_matter.reduce((accumulator, currentVal) => accumulator + currentVal.key + ': "' + currentVal.value + "\"\n", '');
    output += "---\n";

    resolve(output);
  });
};
