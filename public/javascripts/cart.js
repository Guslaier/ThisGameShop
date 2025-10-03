
function increaseValue(button, limit) {
  const numberInput = button.parentElement.querySelector('.number');
  var value = parseInt(numberInput.innerHTML, 10);
  if (isNaN(value)) value = 0;
  if (limit && value >= limit) return;
  numberInput.innerHTML = value + 1;
  updateTotal();
}

function decreaseValue(button) {
  const numberInput = button.parentElement.querySelector('.number');
  var value = parseInt(numberInput.innerHTML, 10);
  if (isNaN(value)) value = 1;
  if (value < 2) return;
  numberInput.innerHTML = value - 1;
  updateTotal();
}

function updateTotal() {
  let total = 0;
  const items = document.querySelectorAll('.cartItem');
  items.forEach(item => {
    const checkbox = item.querySelector('.item-check');
    if (checkbox && checkbox.checked) {
      const price = parseInt(item.querySelector('.cost').innerHTML, 10);
      const qty = parseInt(item.querySelector('.number').innerHTML, 10);
      total += price * qty;
    }
  });
  document.getElementById('showsum').innerText = total;
}

// จัดการ select all
document.getElementById('selectAllCheck').addEventListener('change', function() {
  const checked = this.checked;
  document.querySelectorAll('.item-check').forEach(cb => cb.checked = checked);
  updateTotal();
});

// อัปเดตเมื่อกด checkbox แต่ละรายการ
document.querySelectorAll('.item-check').forEach(cb => {
  cb.addEventListener('change', updateTotal);
});

