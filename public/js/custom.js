$(() => {
  $('.see').click(function () {
    const
      pwd = $('#pwd'),
      tipe = pwd.attr('type'),
      show = tipe === 'password';
    pwd.attr('type', show ? 'text' : 'password');
    $(this).css('color', show ? 'green' : 'red');
  });

  $('#form-login').submit(function (e) {
    e.preventDefault();
    const
      user = $('#user').val().trim(),
      pwd = $('#pwd').val().trim(),
      csrf = $('#csrf').val().trim();
    let err = false, msg = [];

    if (user.length > 15) {
      err = true,
        msg.push(['warning', 'user length < 15']);
    }

    if (err) {
      msg.forEach((x) => {
        $('#out').append(`<p class="alert alert-${x[0]}">${x[1]}</p>\n`);
      });
    } else {
      $('#out').html('');
      $.ajax({
        type: 'POST',
        url: '/login',
        headers: {
          'CSRF-Token': csrf,
          'Content-Type': 'application/json'
        },
        data: JSON.stringify({
          user: user,
          pass: pwd
        }),
        success: (resp) => {
          resp = JSON.parse(resp);
          $('#out').html(`<p class="alert alert-${resp.resp} text-center">${resp.msg}</p>`);
          if (resp.resp === 'success')
            $(location).attr('href', '/');
        }
      });
    }
  });

  $('#form-register').submit(function (e) {
    e.preventDefault();
    const
      name = $('#name').val().trim(),
      user = $('#user').val().trim(),
      mail = $('#mail').val().trim(),
      pass = $('#pwd').val().trim(),
      csrf = $('#csrf').val().trim();
    let err = false, msg = [];

    if (user.length > 15) {
      err = true,
        msg.push(['warning', 'user length < 15']);
    }

    if (name.length > 30) {
      err = true,
        msg.push(['warning', 'name length < 30']);
    }

    if (err) {
      msg.forEach((x) => {
        $('#out').append(`<p class="alert alert-${x[0]}">${x[1]}</p>\n`);
      });
    } else {
      $('#out').html('');
      $.ajax({
        type: 'POST',
        url: '/register',
        headers: {
          'CSRF-Token': csrf,
          'Content-Type': 'application/json'
        },
        data: JSON.stringify({
          name: name,
          user: user,
          mail: mail,
          pass: pass
        }),
        success: (resp) => {
          resp = JSON.parse(resp);
          $('#out').html(`<p class="alert alert-${resp.resp} text-center">${resp.msg}</p>`);
        }
      });
    }
  });
})