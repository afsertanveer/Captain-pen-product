import React, { useState } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const DistributeToShop = () => {
  const username = localStorage.getItem("username");
  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("user_id");
  const navigate = useNavigate();

  const imageHostKey = "ebd4060c9b00b8b0232d789d6ffbf217";

  const [products, setProducts] = useState([]);
  const [productList, setProductList] = useState([]);
  const [disable, setDisable] = useState("");
  const [selectedProductList, setSelectedProductList] = useState([]);
  const [numberOfPieces, setNumberOfPieces] = useState("");
  const [shops, setShops] = useState([]);
  const [customClass, setCustomClass] = useState(
    "absolute mt-1 w-full p-2 bg-white rounded-bl rounded-br max-h-36  overflow-y-auto "
  );
  const [customClassTwo, setCustomClassTwo] = useState("mt-2");
  const [updateError, setUpdateError] = useState("");
  const [paymenetError, setPaymentError] = useState("");
  const [transactionId, setTransactionId] = useState(0);
  const [dueInfo,setDueInfo] = useState([]);
  const [isDueAvailable,setIsDueAvailable] = useState(false);

  const addProduct = (e) => {
    e.preventDefault();
    const searchedProduct = document.getElementById("searchProduct").value;
    const numofPieces = document.getElementById("numOfPieces").value;
    const price = document.getElementById("ppu").value;
    const total = parseFloat(numofPieces) * parseFloat(price);
    let getCurTotal;
    if (document.getElementById("total").value !== "") {
      getCurTotal = parseFloat(document.getElementById("total").value);
    } else {
      getCurTotal = 0;
    }
    const curTotal = (parseFloat(total + getCurTotal).toFixed(2)).toString();
    document.getElementById("total").value = curTotal;
    if (searchedProduct === "") {
      toast.error("Search your product please!");
    } else if (numofPieces === "") {
      toast.error("Enter the number of products");
    } else if (parseInt(numofPieces) > parseInt(numberOfPieces)) {
      toast.error("Exceeding Limit");
    } else {
      setDisable("");
      document.getElementById("searchProduct").value = "";
      document.getElementById("numOfPieces").value = "";
      const singleProduct = {
        product_name: searchedProduct,
        distributed_amount: numofPieces,
        price_per_unit: price,
      };
      const curProductlist = [...selectedProductList];
      let check = 1;
      curProductlist.forEach((item) => {
        if (item.product_name === searchedProduct) {
          if (
            parseInt(item.distributed_amount) + parseInt(numofPieces) <=
            parseInt(numberOfPieces)
          ) {
            item.distributed_amount = (
              parseInt(item.distributed_amount) + parseInt(numofPieces)
            ).toString();
          } else {
            toast.error("Exceeding Limit");
          }
          check = 0;
        }
      });
      if (check === 1) {
        curProductlist.push(singleProduct);
      }
      setSelectedProductList(curProductlist);
      setCustomClass(
        "absolute mt-1 w-full p-2 bg-white rounded-bl rounded-br max-h-36  overflow-y-auto "
      );
      setNumberOfPieces("");
      setCustomClassTwo("mt-2");
    }
  };
  const handleSearchBar = (event) => {
    const newProductpckg = [...productList];
    const searchedList = newProductpckg.filter((p) =>
      p._id.product_name
        .toLowerCase()
        .includes(event.target.value.toLowerCase())
    );
    setProducts(searchedList);
    if (event.target.value === "") {
      setNumberOfPieces("");
      setCustomClass(
        "absolute block mt-1 w-full p-2 bg-white rounded-bl rounded-br max-h-36  overflow-y-auto "
      );
      setProducts([]);
      setCustomClassTwo("mt-2");
    }
    setCustomClassTwo("mt-44");
  };
  const handleSelectOption = (event) => {
    const selectedOption = event.target.value;
    document.getElementById("searchProduct").value = selectedOption;
    let totalNum = productList?.filter(
      (p) => p._id.product_name === selectedOption
    )[0]?.count;
    fetch("http://localhost:5000/group-by-products-sender-shop", {
      method: "GET",
      headers: {
        "content-type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.length > 0) {
          const prevCount = data?.filter(
            (d) =>
              d._id.product_name === selectedOption &&
              d._id.sender_id === userId
          )[0]?.count;
          if (prevCount !== undefined) {
            totalNum = (parseInt(totalNum) - parseInt(prevCount)).toString();
            setNumberOfPieces(totalNum);
          } else {
            setNumberOfPieces(totalNum);
          }
        } else {
          setNumberOfPieces(totalNum);
        }
      });
    setCustomClass("none");
    setProducts([]);
    setDisable("enabled");
  };
  const selectShop = e =>{
    const shop = e.target.value;
    fetch(`http://localhost:5000/due?shop_id=${shop}`,{
      method:"GET",
      headers:{
        "content-type":"application/json"
      }
    })
    .then(res=>res.json())
    .then(data=>{
      if(data.length>0){
        setDueInfo(data);
        setIsDueAvailable(true);
      }
    })
  }
  const handleSubmit = (event) => {
    event.preventDefault();
    const currentDate = new Date();
    const senderId = localStorage.getItem("user_id");
    const recieverId = event.target.selectAsm.value;
    const totalBill = parseFloat(document.getElementById('total').value);
    const paid = parseFloat(document.getElementById('pay').value);
    const due = totalBill - paid ;
    const selected = [...selectedProductList];    
    let img1 = event.target.attach_image1.files[0];
    let img2 = event.target.attach_image2.files[0];
    let img3 = event.target.attach_image3.files[0];
    let img4 = event.target.attach_image4.files[0];
    
    let formData = new FormData();
    formData.append("image", img1);
    let billImg1;

    const url = `https://api.imgbb.com/1/upload?key=${imageHostKey}`;
    fetch(url, {
      method: "POST",
      body: formData,
    })
    .then((res) => res.json())
      .then((imgData) => {
        console.log("dhuke",imgData);
        billImg1=imgData.data.url;
    })
    .catch(err=>console.log(err))
    let billImg2;
     formData = new FormData();
    formData.append("image", img2);
    fetch(url, {
      method: "POST",
      body: formData,
    })
    .then((res) => res.json())
      .then((imgData) => {
        billImg2=imgData.data.url;
    })

    let billImg3;
     formData = new FormData();
    formData.append("image", img3);
    fetch(url, {
      method: "POST",
      body: formData,
    })
    .then((res) => res.json())
      .then((imgData) => {
        billImg3=imgData.data.url;
    })
    let billImg4;
     formData = new FormData();
    formData.append("image", img4);
    fetch(url, {
      method: "POST",
      body: formData,
    })
    .then((res) => res.json())
      .then((imgData) => {
        billImg4=imgData.data.url;     
      
    })
    setTimeout(function() {
      //your code to be executed after 1 second      
    console.log(billImg1,billImg2,billImg3,billImg4);
    let transaction = {};
    let dueEntry = {};
    transaction = {
      transaction_id: transactionId,
      shop_id: recieverId,
      seller_id:senderId,
      total_bill:totalBill,
      due:due,
      bill_img1:billImg1,
      bill_img2:billImg2,
      bill_img3:billImg3,
      bill_img4:billImg4,
      issue_date:currentDate
    }
    const updatedDue = ((parseFloat(dueInfo[0]? dueInfo[0].due : 0) + parseFloat(due)).toFixed(2)).toString();
    dueEntry = {
      shop_id:recieverId,
      seller_id:senderId,
      due:updatedDue,
      issue_date:currentDate
    }
    selected.forEach((item) => {
      item.transaction_id = transactionId;
      item.sender_id = senderId;
      item.reciever_id = recieverId;
      item.recieved_date = currentDate;
    });
    setSelectedProductList(selected);
    selectedProductList.forEach((item) => {
      fetch("http://localhost:5000/distributed-product-to-shop", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(item),
      })
        .then((res) => res.json())
        .then((data) => {
        })
        .catch((error) => setUpdateError(error));
    });
    if (updateError === "") {
      toast.success("Succesfully distributed and stock updated");
      
      fetch("http://localhost:5000/transaction",{
        method:"POST",
        headers:{
          "content-type":"application/json"
        },
        body:JSON.stringify(transaction)
      })
      .then(res=>res.json())
      .then(data=>{
        if (data.acknowledged) {
          if(isDueAvailable){
            const id = dueInfo[0]?._id;
            fetch(`http://localhost:5000/due/${id}`,{
              method:"PUT",
              headers:{
                "content-type":"application/json"
              },
              body:JSON.stringify(dueEntry)
            })
            .then(res=>res.json())
            .then(updateDueData=>{
              if(updateDueData.acknowledged){
                setUpdateError("");
                setPaymentError("");
              }
            })
          }else{
            fetch('http://localhost:5000/due',{
              method:"POST",
              headers:{
                "content-type":"application/json"
              },
              body:JSON.stringify(dueEntry)
            })
            .then(res=>res.json())
            .then(dueData=>{
              if(dueData.acknowledged){
                setUpdateError("");
                setPaymentError("");
              }
            })
          }
          
        }
      })
      .catch(err=>setUpdateError(err))
    } else {
      toast.error(`${updateError}`);
    }
    setSelectedProductList([]);
    event.target.reset();
    }, 5000);
    
  };
  const handlePay = (event) => {
    const pay = parseFloat(document.getElementById("pay").value);
    const total = parseFloat(document.getElementById("total").value);
    if (total < pay) {
      setPaymentError(`Maximum Payment Amount: ${total}`);
      document.getElementById("pay").value = "";
    }
  };
  useEffect(() => {
    if (username === null || role !== "3") {
      localStorage.clear();
      navigate("/");
    }
    fetch("http://localhost:5000/group-by-products-sr", {
      method: "GET",
      headers: {
        "content-type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        data = data?.filter((d) => d._id.reciever_id === userId);
        setProductList(data);
      });

    fetch(`http://localhost:5000/shop?managed_by=${userId}`, {
      method: "GET",
      headers: {
        "content-type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setShops(data);
      });
    fetch("http://localhost:5000/distributed-product-to-shop", {
      method: "GET",
      headers: {
        "content-type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.length > 0) {
          let max = 0;
          data?.forEach((e) => {
            const t_id = parseInt(e.transaction_id);
            if (t_id > max) {
              max = t_id;        
            }
            
          });
          setTransactionId(max+1);
        }
      });
  }, [username, navigate, role, products, userId]);

  return (
    <div className="p-4 lg:p-10">
      <form onSubmit={handleSubmit} autoComplete={"off"}>
        <div className="">
          <div className="relative">
            <input
              type="text"
              onChange={handleSearchBar}
              name=""
              id="searchProduct"
              className="w-1/2 lg:w-[400px] px-5 py-3 text-lg rounded-full  input input-bordered  focus:border-gray-700 outline-none transition"
              placeholder="Type product name"
              disabled={disable}
            />

            <div className={` ${customClass}`}>
              {products.length > 0 && (
                <select
                  onChange={handleSelectOption}
                  className="w-1/2"
                  size={products.length < 3 ? 3 : 5}
                  name=""
                  id=""
                >
                  {products.map((ppckg, index) => (
                    <option key={index} value={ppckg._id.product_name}>
                      {ppckg._id.product_name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>
        <div className="form-control">
          {numberOfPieces && (
            <>
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-bold">Number of Pieces</span>
                </label>
                <input
                  type="number"
                  placeholder="Number of Pieces"
                  className=" input input-bordered w-1/2"
                  name="numOfPieces"
                  id="numOfPieces"
                  min={1}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-bold">Price per Unit</span>
                </label>
                <input
                  type="number"
                  placeholder="Price Per Unit"
                  className=" input input-bordered w-1/2"
                  name="ppu"
                  id="ppu"
                  min={1}
                />
              </div>
            </>
          )}
        </div>

        {numberOfPieces && (
          <>
            <button onClick={addProduct} className="btn btn-outline mt-2">
              Add Product to list
            </button>
          </>
        )}
        <div className={`${customClassTwo} overflow-x-auto px-0 lg:px-4`}>
          {selectedProductList.length > 0 && (
            <>
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>Number Of Pieces</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedProductList.map((it, idx) => (
                    <tr key={idx}>
                      <td>{it.product_name}</td>
                      <td>{it.distributed_amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
        <div className="form-control">
          <label className="label mt-4">
            <span className="label-text font-bold">Attach Chalan 1</span>
          </label>
          <input
            name="attach_image1"
            id="attach_image1"
            type="file"
            className="input input-bordered w-1/2"
            required
          />          
          <span className="text-red-400">Mandatory attachment required</span>
        </div>
        <div className="form-control">
          <label className="label mt-4">
            <span className="label-text font-bold">Attach Chalan 2</span>
          </label>
          <input
            name="attach_image2"
            id="attach_image2"
            type="file"
            className="input input-bordered w-1/2"
            required
          />
        </div>
        <div className="form-control">
          <label className="label mt-4">
            <span className="label-text font-bold">Attach Chalan 3</span>
          </label>
          <input
            name="attach_image3"
            id="attach_image3"
            type="file"
            className="input input-bordered w-1/2"
            required
          />
        </div>
        <div className="form-control">
          <label className="label mt-4">
            <span className="label-text font-bold">Attach Chalan 4</span>
          </label>
          <input
            name="attach_image4"
            id="attach_image4"
            type="file"
            className="input input-bordered w-1/2"
            required
          />
        </div>
        <div className="form-control">
          {productList.length > 0 && (
            <>
              <label className="label mt-4">
                <span className="label-text font-bold">Sell to </span>
              </label>
              <select
                onChange={selectShop}
                name="selectAsm"
                className=" input input-bordered w-1/2 mb-4"
                required
              >
                <option></option>
                {shops.length > 0 &&
                  shops.map((shop) => (
                    <option key={shop._id} value={shop._id}>
                      {shop.shop_name}
                    </option>
                  ))}
              </select>
            </>
          )}
        </div>
        <div className="form-control">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-bold">Total</span>
            </label>
            <input
              type="number"
              placeholder="Number of Pieces"
              className="w-1/2 px-5 py-3 text-lg rounded-full  input input-bordered  focus:border-gray-700 outline-none transition"
              name="total"
              id="total"
              min={1}
              disabled
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text font-bold">Pay</span>
            </label>
            <input
              type="number"
              placeholder="Price Per Unit"
              onChange={handlePay}
              className=" input input-bordered w-1/2 text-green-500"
              name="pay"
              id="pay"
              min={1}
            />
            {paymenetError && (
              <span className="text-2l text-red-600 font-semibold">
                {paymenetError}
              </span>
            )}
          </div>
        </div>
        <input
          type="submit"
          className="btn btn-success text-white ml-3 mt-7"
          value="Send To Shop"
        />
      </form>
    </div>
  );
};

export default DistributeToShop;
