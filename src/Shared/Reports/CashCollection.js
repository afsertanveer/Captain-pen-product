import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Loader from "../../Loader/Loader";
import { CSVLink } from "react-csv";

const CashCollection = () => {
  const username = localStorage.getItem("username");
  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("user_id");
  const name = localStorage.getItem("name");
  const navigate = useNavigate();
  const [due, SetDue] = useState([]);
  const [dueRecovery, setDueRecovery] = useState([]);
  const [users, setUsers] = useState([]);
  const [shops, setShops] = useState([]);
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [regions, setRegions] = useState([]);
  const getCashCollectionData = [];
  let shopName;
  let shopAddress;
  let srName;
  let asmName;
  let zoneName;
  let adminName;
  let totalDue;
  let totalCashCollection;
  let count = 1;
  let serial = 1;
  const setExcelDataBundle = () => {
    shops.forEach((sh) => {
      let singleItem = {};
      totalCashCollection = 0.0;
      shopName = sh.shop_name;
      shopAddress = sh.address;
      let srNameId = users.filter((us) => us._id === sh.managed_by)[0]?._id;
      srName = users.filter((us) => us._id === sh.managed_by)[0]?.name;
      let asmNameId = users.filter((us) => us._id === srNameId)[0]?.managed_by;
      let regionId = users.filter((us) => us._id === srNameId)[0]?.region_id;
      zoneName = regions.filter((rg) => rg._id === regionId)[0]?.region_name;
      asmName = users.filter((us) => us._id === asmNameId)[0]?.name;
      let adminId = users.filter((us) => us._id === asmNameId)[0]?.managed_by;
      adminName = users.filter((us) => us._id === adminId)[0]?.name;
      totalDue = due.filter((d) => d.shop_id === sh._id)[0]?.due;
      const recoveries = dueRecovery.filter((dr) => dr.shop_id === sh._id);
      if (recoveries.length > 0) {
        for (let i = 0; i < recoveries.length; i++) {
          singleItem = {};
          singleItem.serialIndex = count;
          singleItem.shopName = shopName;
          singleItem.shopAddress = shopAddress;
          if(role==='3'){
            if(srName===name){
              singleItem.srName = srName;
            }
          }else{
            singleItem.srName = srName;
          }
          
          if(role!=='3'){
            if(role==='2'){
              if(asmName===name){
                singleItem.asmName = asmName;
              }
            }else{
              singleItem.asmName = asmName;
            }
            
          }
          if(role==='0' || role==='1'){
            if(role===1){
              if(adminName===name){
                singleItem.adminName = adminName;
              }
            }else{
              singleItem.adminName = adminName;
            }
          }
          if(role==='0'){
            singleItem.zoneName = zoneName;
          }         
          singleItem.collectedCash = recoveries[i].paying_amount;
          singleItem.prevDue = totalDue;
          totalCashCollection = parseFloat(
            totalCashCollection + parseFloat(recoveries[i].paying_amount)
          );          
          singleItem.curDue = parseFloat(totalDue)-  parseFloat(totalCashCollection);
          singleItem.totalCashCollection = totalCashCollection;
          singleItem.issueDate = recoveries[i].issue_date;
          singleItem.bill_link = recoveries[i].bill_link;
          if(role==='1'){
            if(singleItem.adminName===name){
              getCashCollectionData.push(singleItem);
              count++;
            }
          }else if(role==='2'){
            if(singleItem.asmName===name){
              getCashCollectionData.push(singleItem);
              count++;
            }
          }else if(role==='3'){
            if(singleItem.srName===name){
              getCashCollectionData.push(singleItem);
              count++;
            }

          }else{
            getCashCollectionData.push(singleItem);
            count++;
          }

          
        }
      } else {
        singleItem = {};
        singleItem.serialIndex = count;
        singleItem.shopName = shopName;
        singleItem.shopAddress = shopAddress;
        if(role==='3'){
          if(srName===name){
            singleItem.srName = srName;
          }
        }else{
          singleItem.srName = srName;
        }
        
        if(role!=='3'){
          if(role==='2'){
            if(asmName===name){
              singleItem.asmName = asmName;
            }
          }else{
            singleItem.asmName = asmName;
          }
          
        }
        if(role==='0' || role==='1'){
          if(role===1){
            if(adminName===name){
              singleItem.adminName = adminName;
            }
          }else{
            singleItem.adminName = adminName;
          }
        }
        if(role==='0'){
          singleItem.zoneName = zoneName;
        }
        singleItem.collectedCash = 0;
        singleItem.prevDue = totalDue;
        singleItem.totalCashCollection = totalCashCollection;
        singleItem.curDue = parseFloat(totalDue)-  parseFloat(totalCashCollection);
        singleItem.issueDate = due.filter(
          (d) => d.shop_id === sh._id
        )[0]?.issue_date;
        singleItem.bill_link = "";
        if(role==='1'){
          if(singleItem.adminName===name){
            getCashCollectionData.push(singleItem);
            count++;
          }
        }else if(role==='2'){
          if(singleItem.asmName===name){
            getCashCollectionData.push(singleItem);
            count++;
          }
        }else if(role==='3'){
          if(singleItem.srName===name){
            getCashCollectionData.push(singleItem);
            count++;
          }

        }else{
          getCashCollectionData.push(singleItem);
          count++;
        }
      }
    });
  };

  setExcelDataBundle();

  useEffect(() => {
    setIsLoading(true);
    if (
      username === undefined ||
      (role === "0" || role === "1" || role === "2" || role === "3") === false
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
        if (data.length > 0) {
          const uName = data.filter((d) => d._id === userId)[0]?.name;
          setFullName(uName);
        }
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
    fetch(`http://localhost:5000/due`, {
      method: "GET",
      headers: {
        "content-type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        SetDue(data);
        setIsLoading(false);
      });
    fetch(`http://localhost:5000/due-recovery`, {
      method: "GET",
      headers: {
        "content-type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setDueRecovery(data);
        setIsLoading(false);
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
        <p className="text-4xl font-bold mb-4">Cash Collection</p>
      </div>
      {isLoading && <Loader></Loader>}
      <div className="overflow-x-auto px-0 lg:px-4">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>SI No</th>
              <th>Issue Date</th>
              <th>Shop Name</th>
              <th>Shop Address</th>
              <th>Cash Collection</th>
              <th>Previous Due</th>
              <th>Total Cash Collection</th>
              <th>Current Due</th>
              {(role === "0" || role === "1") && <th>Zone Name</th>}
              {role !== "3" && <th>SR Name</th>}
              {(role === "0" || role === "1") && <th>ASM Name</th>}
              {role === "0" && <th>Admin Name</th>}
              <th>Payment Image Links</th>
            </tr>
          </thead>
          <tbody>
            {getCashCollectionData.length > 0 &&
              getCashCollectionData.map((se, idx) => {
                return (
                  role === "1" &&
                  se.adminName === fullName &&
                  se.issueDate !==
                    undefined(
                      <tr key={idx + 1}>
                        <td>{serial++}</td>
                        <td>{se.issueDate}</td>
                        <td>{se.shopName}</td>
                        <td>{se.shopAddress}</td>
                        <td>{se.collectedCash}</td>
                        <td>{se.prevDue}</td>
                        <td>{se.totalCashCollection}</td>
                        <td>{se.curDue}</td>
                        {(role === "0" || role === "1") && (
                          <>
                            <td>{se.zoneName}</td>
                          </>
                        )}
                        <td>{se.srName}</td>
                        <td>{se.asmName}</td>
                        {role === "0" && <td>{se.adminName}</td>}
                        <td>
                          {se.bill_link !== "" ? (
                            <Link
                              target="_blank"
                              className="text-xl  font-medium text-green-300 hover:text-white underline"
                              to={`${se.bill_link}`}
                            >{`Click to see`}</Link>
                          ) : (
                            <span className="text-red-400 font-semibold text-xl">Yet to Collect Cash</span>
                          )}
                        </td>
                      </tr>
                    )
                );
              })}
            {role === "0" &&
              getCashCollectionData.length > 0 &&
              getCashCollectionData.map((se, idx) => {
                return (
                  se.issueDate !== undefined && (
                    <tr key={idx}>
                      <td>{serial++}</td>
                      <td>{se.issueDate}</td>
                      <td>{se.shopName}</td>
                      <td>{se.shopAddress}</td>
                      <td>{se.collectedCash}</td>
                      <td>{se.prevDue}</td>
                      <td>{se.totalCashCollection}</td>
                      <td>{se.curDue}</td>
                      <td>{se.zoneName}</td>
                      <td>{se.srName}</td>
                      <td>{se.asmName}</td>
                      <td>{se.adminName}</td>
                      <td>
                      {se.bill_link !== "" ? (
                          <Link
                            target="_blank"
                            className="text-xl font-medium text-green-300 hover:text-white underline"
                            to={`${se.bill_link}`}
                          >{`Click to see`}</Link>
                        ) : (
                          <span className="text-red-400 font-semibold text-xl">Yet to Collect Cash</span>
                        )}
                      </td>
                    </tr>
                  )
                );
              })}
            {getCashCollectionData.length > 0 &&
              getCashCollectionData.map((se, idx) => {
                return (
                  role === "2" &&
                  se.asmName === fullName &&
                  se.issueDate !== undefined && (
                    <tr key={se.serialIndex}>
                      <td>{serial++}</td>
                      <td>{se.issueDate}</td>
                      <td>{se.shopName}</td>
                      <td>{se.shopAddress}</td>
                      <td>{se.discount}</td>
                      <td>{se.collectedCash}</td>
                      <td>{se.prevDue}</td>
                      <td>{se.totalCashCollection}</td>
                      <td>{se.curDue}</td>
                      {(role === "0" || role === "1") && (
                        <>
                          <td>{se.zoneName}</td>
                        </>
                      )}
                      <td>{se.srName}</td>
                      <td>{se.asmName}</td>
                      {role === "0" && <td>{se.adminName}</td>}
                      <td>
                      {se.bill_link !== "" ? (
                          <Link
                            target="_blank"
                            className="text-xl font-medium text-green-300 hover:text-white underline"
                            to={`${se.bill_link}`}
                          >{`Click to see`}</Link>
                        ) : (
                          <span className="text-red-400 font-semibold text-xl">Yet to Collect Cash</span>
                        )}
                      </td>
                    </tr>
                  )
                );
              })}
            {getCashCollectionData.length > 0 &&
              getCashCollectionData.map((se, idx) => {
                return (
                  role === "3" &&
                  se.srName === fullName &&
                  se.issueDate !== undefined && (
                    <tr key={se.serialIndex}>
                      <td>{serial++}</td>
                      <td>{se.issueDate}</td>
                      <td>{se.shopName}</td>
                      <td>{se.shopAddress}</td>
                      <td>{se.collectedCash}</td>
                      <td>{se.prevDue}</td>
                      <td>{se.totalCashCollection}</td>
                      <td>{se.curDue}</td>
                      <td>
                        {se.bill_link !== "" ? (
                          <Link
                            target="_blank"
                            className="text-xl font-medium text-green-300 hover:text-white underline"
                            to={`${se.bill_link}`}
                          >{`Click to see`}</Link>
                        ) : (
                          <span className="text-red-400 font-semibold text-xl">Yet to Collect Cash</span>
                        )}
                      </td>
                    </tr>
                  )
                );
              })}
          </tbody>
        </table>
      </div>
      <div className="mt-3  px-0 lg:px-4">
        <CSVLink
          data={getCashCollectionData}
          filename={"cash-collection.csv"}
          className="mt-3 btn bg-green-900"
          target="_blank"
        >
           Download{" "}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="ml-2 w-5 h-5"
          >
            <path
              fillRule="evenodd"
              d="M12 2.25a.75.75 0 01.75.75v11.69l3.22-3.22a.75.75 0 111.06 1.06l-4.5 4.5a.75.75 0 01-1.06 0l-4.5-4.5a.75.75 0 111.06-1.06l3.22 3.22V3a.75.75 0 01.75-.75zm-9 13.5a.75.75 0 01.75.75v2.25a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5V16.5a.75.75 0 011.5 0v2.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V16.5a.75.75 0 01.75-.75z"
              clipRule="evenodd"
            />
          </svg>
        </CSVLink>
      </div>
    </div>
  );
};

export default CashCollection;
