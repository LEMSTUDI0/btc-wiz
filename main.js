document.addEventListener('DOMContentLoaded', function() {
    const changeButton = document.getElementById('changeBackground');
    const background1 = document.querySelector('.background1');
    const background2 = document.querySelector('.background2');
  
    changeButton.addEventListener('click', function() {
      background1.classList.toggle('active');
      background2.classList.toggle('active');
    });
  });
  