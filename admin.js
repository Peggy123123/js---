
const token = `2yzObFLQ1MaJ960vgU0TFLfHDbA3`;
const path = `peggy`;
const url = `https://livejs-api.hexschool.io/api/livejs/v1/admin/${path}`;

//取得訂單資料
let orderData = [];

function getOderData(){
    axios.get(`${url}/orders`,{  //api文件上寫需在header帶入token
        headers: {
            'Authorization': token
        }
    })
    .then(function(res){
        orderData = res.data.orders;
        console.log(orderData);
        renderOrderList();
        getObjData();
    })
    .catch(function(error){
        console.log(error);
    })
};

getOderData();

//渲染訂單資料
const orderPageTable = document.querySelector('.orderPage-table');

function renderOrderList(){
    let str = "";
    //增加標頭
    str+=`<thead> 
            <tr>
                <th width="10%">訂單編號</th>
                <th width="5%">聯絡人</th>
                <th width="20%">聯絡地址</th>
                <th width="15%">電子郵件</th>
                <th width="20%">訂單品項</th>
                <th width="10%">訂單日期</th>
                <th width="15%">訂單狀態</th>
                <th width="5%">操作</th>
            </tr>
        </thead>`

    orderData.forEach(item=>{ 
        //取得訂單內的產品清單
        let productStr = "";
        item.products.forEach((product)=>{
        productStr+= `${product.title}x${product.quantity}<br>`;
        });
        //訂單狀態
        let orderStatus = "";
        if(item.paid){
            orderStatus = "已處理";
        }else if(!item.paid){
            orderStatus = "未處理";
        }

        str+=`<tr>
        <td class="orderId">${item.id}</td>
        <td>
          <p>${item.user.name}</p>
          <p>${item.user.tel}</p>
        </td>
        <td>${item.user.address}</td>
        <td>${item.user.email}</td>
        <td>
          <p>${productStr}</p>
        </td>
        <td>${item.createdAt}</td>
        <td class="orderStatus">
        <button type="button" class="btn btn-primary changeStatusBtn" data-bs-toggle="modal" data-bs-target="#statusBtn" data-id="${item.id}" data-status="${orderStatus}">${orderStatus}</button>
        </td>
        <td>
        <input type="button" class="btn btn-danger delSingleOrder-Btn" id="deleteBtn" data-id="${item.id}" value="刪除">
        </td>
    </tr>`
    });
    orderPageTable.innerHTML = str;
    changeStatusPaid();
}

//刪除單筆訂單
const deleteBtn = document.querySelector('.delSingleOrder-Btn');

function deleteOrderBtn(){
    orderPageTable.addEventListener('click',e=>{
        e.preventDefault();
        const idName = e.target.getAttribute('id')
        if (idName !== "deleteBtn"){
            return
        }else{
            let orderid = e.target.getAttribute('data-id');
            deleteOrder(orderid)
        }
    })
};

function deleteOrder(id){
    axios.delete(`${url}/orders/${id}`,{
        headers: {
            'Authorization': token
        }
    })
    .then(function(res){
        console.log(res.data);
        alert('訂單已被刪除')
        getOderData();
    })
    .catch(function(error){
        console.log(error.response.data.message);
        alert('請重新操作')
    })
};

deleteOrderBtn();

//刪除全部訂單
const discardAllBtn = document.querySelector('.discardAllBtn');

function deleteAllBtn(){
    discardAllBtn.addEventListener('click',e=>{
        e.preventDefault();
        deleteAllOrders()
    })
};

function deleteAllOrders(){
    axios.delete(`${url}/orders`,{
        headers: {
            'Authorization': token
        }
    })
    .then(function(res){
        console.log(res.data);
        alert('您已刪除全部訂單')
        getOderData();
    })
    .catch(function(error){
        console.log(error.response.data.message);
        alert('請重新操作')
    })
}

deleteAllBtn();

//修改訂單狀態
const orderStatus = document.querySelector('.orderStatus');
const changePaidBtn = document.querySelector('.changePaid');

function changeStatusPaid(){
    let orderId="";
    let paid=Boolean;
    const changeStatusBtn = document.querySelectorAll('.changeStatusBtn');

    changeStatusBtn.forEach(item=>{
        item.addEventListener('click',e=>{
            if(item.getAttribute('data-status') === "未處理"){
                orderId = e.target.getAttribute('data-id');
                paid = true;
                changePaidBtn.addEventListener('click',e=>{
                    changePaid(orderId,paid);
                })
            }else if(item.getAttribute('data-status') === "已處理"){
                orderId = e.target.getAttribute('data-id');
                paid = false;
                changePaidBtn.addEventListener('click',e=>{
                    changePaid(orderId,paid);
                })
            }
        });
    })
}

function changePaid(id,paid){
    axios.put( `${url}/orders`,{
        data: {
            id: id,
            paid: paid
        }
    },
    {
        headers: {
            'Authorization': token
        }
    })
        .then(function(res){
            getOderData();
            
        })
        .catch(function(error){
            console.log(error.response.data.message);
        })
    };


// C3.js
let obj ={};
function getObjData(){
    orderData.forEach(item=>{
        item.products.forEach(x=>{
            if (obj[x.category] === undefined){
                obj[x.category] = (x.price*x.quantity)
            }else{
                obj[x.category]+= (x.price*x.quantity)
            }
        });    
    });
    getArrData()
    
}
let newData = [];
function getArrData(){
    let area = Object.keys(obj);
    area.forEach(item=>{
        let arr =[];
        arr.push(item);
        arr.push(obj[item]);
        newData.push(arr)
    });
    renderChart()
}

//[[床架,$]、[收納,$]、[窗簾,$]] 丟這個格式進圖表
function renderChart(){
    let chart = c3.generate({
        bindto: '#chart', // HTML 元素綁定
        data: {
            type: "pie",
            columns: newData,
            colors:{
                "Louvre 雙人床架":"#DACBFF",
                "Antony 雙人床架":"#9D7FEA",
                "Anty 雙人床架": "#5434A7",
                "其他": "#301E5F",
            }
        },
    });
}

