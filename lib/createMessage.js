module.exports = (values, sundayDate) => {
  return new Promise(function(resolve, reject) {
    let date = new Date();
    let output = '';
    let default_values = [
      {
        key: 'date',
        value: sundayDate
      }
    ];

    let front_matter = values.concat(default_values);

    output = "---\n";
    output += front_matter.reduce((accumulator, currentVal) => accumulator + currentVal.key + ': "' + currentVal.value + "\"\n", '');
    output += "---\n";

    resolve(output);
  });
};
