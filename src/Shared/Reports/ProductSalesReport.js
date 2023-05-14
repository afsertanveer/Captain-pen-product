import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../../Loader/Loader";
import { CSVLink } from "react-csv";

const ProductSalesReport = () => {
  const username = localStorage.getItem("username");
  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("user_id");
  const name = localStorage.getItem("name");
  const navigate = useNavigate();
  const [sales,SetSales] = useState([]);
  const [users, setUsers] = useState([]);
  const [shops, setShops] = useState([]);
  const [products,setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [regions, setRegions] = useState([]);
  const productSalesReportData = [];
  
  let adminName;
  let count = 1;
  let totProducts=0.0;
  let totCash = 0.0
  const setExcelDataBundle = () => {
    sales.forEach((sh) => {
      let singleItem = {};
      singleItem.serialIndex = count;
      singleItem.issueDate = sh.recieved_date;
      singleItem.productName = sh.product_name;
      const shopId = sh.reciever_id;
      singleItem.shopName = shops.filter(shop=>shop._id===shopId)[0]?.shop_name;
      singleItem.shopAddress =shops.filter(shop=>shop._id===shopId)[0]?.address;
      let srNameId = users.filter((us) => us._id === sh.sender_id)[0]?._id;
      singleItem.srName = users.filter((us) => us._id === sh.sender_id)[0]?.name;
      let asmNameId = users.filter((us) => us._id === srNameId)[0]?.managed_by;
      let regionId = users.filter((us) => us._id === srNameId)[0]?.region_id;
      singleItem.zoneName = regions.filter((rg) => rg._id === regionId)[0]?.region_name;
      singleItem.asmName = users.filter((us) => us._id === asmNameId)[0]?.name;
      let adminId = users.filter((us) => us._id === asmNameId)[0]?.managed_by;
      adminName = users.filter((us) => us._id === adminId)[0]?.name;
      singleItem.adminName = adminName;
      singleItem.totalUnits = sh.distributed_amount;
      singleItem.perUnitPrice = sh.price_per_unit;
      singleItem.totalPrice = (parseFloat(sh.distributed_amount))*(parseFloat(sh.price_per_unit))
      totProducts= totProducts + parseInt(sh.distributed_amount)
      totCash = totCash + (parseFloat(sh.distributed_amount))*(parseFloat(sh.price_per_unit))
      let category = products.filter(p=>p.product_name===sh.product_name)[0]?.category;
      if(products.filter(p=>p.product_name===sh.product_name)[0]?.secondary_category!==""){
        category = category+`=> ${products.filter(p=>p.product_name===sh.product_name)[0]?.secondary_category}`;
      }
      singleItem.category = category;
      if(role==='1'){
        if(adminName===name){
            productSalesReportData.push(singleItem)
          }
      }else{
        productSalesReportData.push(singleItem)
        count++;
      }
      
      
    });
  };

  setExcelDataBundle();

  useEffect(() => {
    setIsLoading(true);
    if (
      username === undefined ||
      (role === "0" || role === "1" ) === false
    ) {
      localStorage.clear();
      navigate("/");
    }
    fetch(`http://localhost:5000/users`, {
      method: "GET",
      headers: {
        "content-type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setIsLoading(false);
        setUsers(data);
      });
    fetch(`http://localhost:5000/product`, {
      method: "GET",
      headers: {
        "content-type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setIsLoading(false);
        setProducts(data);
      });
    fetch(`http://localhost:5000/shop`, {
      method: "GET",
      headers: {
        "content-type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setShops(data);
        setIsLoading(false);
      });
    
      fetch("http://localhost:5000/distributed-product-to-shop", {
        method: "GET",
        headers: {
          "content-type": "application/json",
        },
      })
        .then((res) => res.json())
        .then((data) => {
          setIsLoading(false);
          SetSales(data);
        });

    fetch(`http://localhost:5000/region`, {
      method: "GET",
      headers: {
        "content-type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setRegions(data);
        setIsLoading(false);
      });
  }, [username, navigate, userId, role]);
  return (
    <div>
      <div className="text-center py-4 mx-0 lg:mx-4 bg-green-300 my-8 text-white">
        <p className="text-4xl font-bold mb-4">Product Sales</p>
      </div>
      {isLoading && <Loader></Loader>}
      <div className="overflow-x-auto px-0 lg:px-4">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>SI No</th>
              <th>Issue Date</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>Units</th>
              <th>Per Unit Price</th>
              <th>Total</th>
              <th>Shop Name</th>
              <th>Shop Address</th>
               <th>Zone Name</th>
              <th>SR Name</th>
              <th>ASM Name</th>
              {role === "0" && <th>Admin Name</th>}
            </tr>
          </thead>
          <tbody>
            {
                productSalesReportData.length>0 && productSalesReportData.map(p=>{
                    return <tr key={p.serialIndex}>
                        <td>{p.serialIndex}</td>
                        <td>{p.issueDate}</td>
                        <td>{p.productName}</td>
                        <td>{p.category}</td>
                        <td>{p.totalUnits}</td>
                        <td>{p.perUnitPrice}</td>
                        <td>{p.totalPrice}</td>
                        <td>{p.shopName}</td>
                        <td>{p.shopAddress}</td>
                        <td>{p.zoneName}</td>
                        <td>{p.srName}</td>
                        <td>{p.asmName}</td>
                        {role==='0' && <td>{p.adminName}</td>}
                    </tr>
                })
            }
          </tbody>
        </table>
      </div>
      {role==='0' && <div className="my-5  px-0 lg:px-4 flex justify-around items-center">
          <span className="text-xl font-semibold text-red-500">{`Total Products=> ${totProducts}`}</span>
          <span className="text-xl font-semibold text-red-500">{`Total Sold Price=> ${totCash}`}</span>
      </div>}
      <div className="mt-3  px-0 lg:px-4">
        <CSVLink
          data={productSalesReportData}
          filename={"product-sale-report.csv"}
          className="mt-3 btn btn-secondary"
          target="_blank"
        >
          Download me
        </CSVLink>
      </div>
    </div>
  );
};

export default ProductSalesReport;
