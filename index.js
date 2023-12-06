const url = `https://livejs-api.hexschool.io/api/livejs/v1/customer/`;
const path = `peggy`;

//取得商品清單
let productData = [];

function getProductList() {
  axios.get(`${url + path}/products`)
    .then(function (res) {
      productData = res.data.products;
      renderProduct();
    })
    .catch(function (error) {
      console.log(error);
    });
}

getProductList();

//渲染商品清單
//再渲染商品清單時，就要把商品id存在加入購物車按鈕的自訂屬性上
const productWrap = document.querySelector(".productWrap");

function renderProduct() {
  let str = "";
  productData.forEach((item, i) => {
    str += `<li class="productCard">
    <h4 class="productType">新品</h4>
    <img src="${item.images}" alt="photo">
    <a href="#" class="addCardBtn" data-id="${item.id}">加入購物車</a> 
<h3>${item.title}</h3><del class="originPrice">NT$${item.origin_price}</del>
<p class="nowPrice">NT$${item.price}</p>
</li>`;
  });
  productWrap.innerHTML = str;
}

//篩選商品 不用包在function內
const productSelect = document.querySelector('.productSelect');

    productSelect.addEventListener('change',e=>{
        str="";
        productData.forEach(function(item){
            if(e.target.value === "全部"){
                str += `<li class="productCard">
                <h4 class="productType">新品</h4>
                <img src="${item.images}" alt="photo">
                <a href="#" class="addCardBtn" data-id="${item.id}">加入購物車</a> 
            <h3>${item.title}</h3><del class="originPrice">NT$${item.origin_price}</del>
            <p class="nowPrice">NT$${item.price}</p>
            </li>`
            }else if(e.target.value === item.category){
                str+= `<li class="productCard">
                <h4 class="productType">新品</h4>
                <img src="${item.images}" alt="photo">
                <a href="#" class="addCardBtn" data-id="${item.id}">加入購物車</a> 
            <h3>${item.title}</h3><del class="originPrice">NT$${item.origin_price}</del>
            <p class="nowPrice">NT$${item.price}</p>
            </li>`
            }
        });
        productWrap.innerHTML = str;
    });

//取得購物車資料
const shoppingCartTable = document.querySelector(".shoppingCart-table");
let cartsList = [];

function getCartList() {
  axios
    .get(`${url + path}/carts`)
    .then(function (res) {
      cartsList = res.data;
      renderCartList();

        if(cartsList.carts.length !== 0){
            getdeleteAllItem();
        }
    })
    .catch(function (error) {
      console.log(error);
    });
}

getCartList();

//渲染購物車畫面
const finalTotalPrice = document.querySelector('.finalTotalPrice');
function renderCartList() {
  let content = 
    `<tr>
    <th width="40%">品項</th>
    <th width="15%">單價</th>
    <th width="15%">數量</th>
    <th width="15%">金額</th>
    <th width="15%"></th>
    </tr>`;
    let finalTotal = 0;
  cartsList.carts.forEach((item, i) => {
    total = item.product.price*item.quantity;
    finalTotal +=total;
    content += `
    <tr>
    <td>
    <div class="cardItem-title">
    <img src="${item.product.images}" alt="">
    <p>${item.product.title}</p>
    </div>
    </td>
    <td>NT$${item.product.price}</td>
    <td> <a href="#" <i class="fa-solid fa-square-minus quantity-calc" data-id="${item.id}"></i></a><span class="quantity-container">${item.quantity}</span><a href="#" <i class="fa-solid fa-square-plus quantity-calc" data-id="${item.id}"></i></a></td>
    <td>NT$${total.toLocaleString()}</td>
            <td class="discardBtn">
            <a href="#" class="material-icons" id="discardBtn" data-id="${item.id}">clear</a>
            </td></tr>`;
  });
    content+=`<tr>
            <td>
            <a href="#" class="discardAllBtn">刪除所有品項</a>
            </td>
            <td></td>
            <td></td>
            <td>
            <p>總金額</p>
            </td>
            <td>NT$${finalTotal.toLocaleString()}</td>
            </tr>`
    if (cartsList.carts.length !== 0){
        shoppingCartTable.innerHTML = content;
        quantityMinus();
        quantityPlus();
    }else{
        shoppingCartTable.innerHTML =`<p>您的購物車已經空了，快來選購！<p/>`
    }
  
}

//加入購物車
productWrap.addEventListener('click',(e)=>{
    e.preventDefault();
    let className =  e.target.getAttribute('class');
    if(className !== "addCardBtn" ){
        return
    }
    const productId =  e.target.getAttribute('data-id');
    addCardItem (productId);
})

function addCardItem (id){
    axios.post(`${url + path}/carts`, {
        data: {
            productId: id ,
            quantity: 1
        }
        })
        .then(function (res) {
            getCartList()
        });
}

    //減少商品數量
function quantityMinus(){
    const minusBtn = document.querySelectorAll('.fa-square-minus');
    let CartId;
    let minusNum;
    minusBtn.forEach(item=>{
        item.addEventListener('click',e=>{
            if (parseInt(item.nextSibling.textContent) > 1){  //當購物車數量大於1才能減少
                minusNum = parseInt(item.nextSibling.textContent);
                minusNum-=1;
                item.nextSibling.textContent = minusNum;
                CartId = item.getAttribute('data-id')
            }; 
            patchCart(CartId,minusNum)
        });
    })  
    }
    
    //增加商品數量
    function quantityPlus(){
    const plusBtn = document.querySelectorAll('.fa-square-plus');
    let CartId;
    let plusNum;
    plusBtn.forEach(item=>{
        item.addEventListener('click',e=>{
            let plusNum = parseInt(item.previousSibling.textContent);
            plusNum+=1;
            item.previousSibling.textContent = plusNum;
            CartId = item.getAttribute('data-id');
            patchCart(CartId,plusNum)
        })
    })  
    }

//傳送增減數量到後端
    function patchCart(id, num){
        axios.patch(`${url+path}/carts`, {
            data: {
            id: id,
            quantity: num
            }
        })
        .then(function(res){
            console.log(res.data);
            getCartList()
        })
        .catch(function(error){
            console.log(error.response.data);
        })
    }
    


//刪除指定購物車商品
shoppingCartTable.addEventListener('click',(e)=>{
    e.preventDefault();
    const idName = e.target.getAttribute('id');
    if(idName !== "discardBtn" ){
        return
    }
    const CartId = e.target.getAttribute('data-id');
    deleteItem(CartId);
})

function  deleteItem(id){
    axios.delete(`${url+path}/carts/${id}`)
    .then(function(res){
        getCartList();
    })
    .catch(function(error){
        console.log(error);
        alert("要刪除的商品不存在")
    })
}


//監聽全部刪除鍵
function getdeleteAllItem(){
    let discardAllBtn = document.querySelector('.discardAllBtn');

    discardAllBtn.addEventListener('click',(e)=>{
        e.preventDefault();
        deleteAllItem();
    });
};

//刪除全部購物車商品
function deleteAllItem(){
    axios.delete(`${url+path}/carts`)
    .then(function(res){
        getCartList();
    })
    .catch(function(error){
        console.log(error);
        alert("要刪除的商品不存在")
    })
};



//送出訂單
const form = document.querySelector('.orderInfo-form');
const orderInfoBtn = document.querySelector('.orderInfo-btn');
const customerName = document.getElementById('customerName');
const customerPhone = document.getElementById('customerPhone');
const customerEmail = document.getElementById('customerEmail');
const customerAddress = document.getElementById('customerAddress');
const tradeWay = document.getElementById('tradeWay');


//取得欄位資料
orderInfoBtn.addEventListener('click',(e)=>{
    e.preventDefault();

    let name = customerName.value;
    let phone = customerPhone.value;
    let email = customerEmail.value;
    let address = customerAddress.value;
    let pay = tradeWay.value;
    submitOrder(name,phone,email,address,pay)
});

//送出
function submitOrder(name,phone,email,address,pay){
    axios.post(`${url+path}/orders` ,{
    "data": {
        "user": {
            "name": name,
            "tel": phone,
            "email": email,
            "address": address,
            "payment": pay
            }
        }
      })
      .then(function(res){
        alert("訂單已成功送出");
        form.reset();
        getCartList()

      })
      .catch(function(error){
        console.log(error.response.data.message);
        alert("請確認購物車內至少有一件商品")
      })

    
}


//表單驗證

const pattern = /^09\d{8}$/;
const constraints = {
    姓名: {   //對應input裡的name屬性
      presence: {
        message: "為必填",
      },
    },
    電話 :{
        presence: {
            message: "為必填",
          },
        format: {
            pattern:pattern,
            message: "不符合格式",
        }
    },
    Email:{
        presence: {
            message: "為必填",
          },
        email: {
            message: "不符合格式",
        }
    },
    寄送地址: {
        presence: {
            message: "為必填",
          }
    }
  };

// 屬性選擇器
const inputs = document.querySelectorAll('input[type=text],input[type=tel],input[type=email]');
let discardAllBtn = document.querySelector('.discardAllBtn');

function formValidate(){
    // 以 forEach 監聽每個 input，監聽 change 變動
    inputs.forEach((item)=>{
        item.addEventListener('change',function(){
            item.nextElementSibling.textContent ="";
            let errors = validate(form, constraints);
            console.log(errors);

            // 有錯就呈現在畫面上
            if(errors){
                Object.keys(errors).forEach(function (keys) {
                    console.log(keys);
                    document.querySelector(`[data-message="${keys}"]`).textContent = errors[keys];
            });
            orderInfoBtn.setAttribute("disabled","disabled");
            orderInfoBtn.classList.add('disabled')
        }else {
            orderInfoBtn.removeAttribute("disabled")
            orderInfoBtn.classList.remove('disabled')
        }
        })
    })
}

formValidate();