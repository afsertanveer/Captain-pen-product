import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../../Loader/Loader";
import Pagination from "../../Shared/Pagination/Pagination";

const ShowShops = () => {
  const username = localStorage.getItem("username");
  const role = localStorage.getItem("role");
  const userId = localStorage.getItem('user_id');
  const navigate = useNavigate();
  const [shops, setShops] = useState([]);
  const [district, setDistrict] = useState([]);
  const [thana, setThana] = useState([]);
  const [subD, setSubD] = useState([]);
  const [isLoading,setIsLoading] = useState(false);  
  const [pagiNationData,setPagiNationData] = useState({});
  const handlePageClick = (event) => {
    let clickedPage = parseInt(event.selected) + 1;
    if (event.selected > 0) {
      
      fetch(
        `http://localhost:5000/paginated-shops?page=${clickedPage}&managed_by=${userId}`,{
          method:"GET"
        }
      )
      .then(res=>res.json())
      .then((data) => {
       setShops(data.shopdata);
        setPagiNationData(data.paginateData);
      })
      .catch((e) => {
        console.log(e);
        setPagiNationData({});
      });
    } else {
      fetch(
        `http://localhost:5000/paginated-shops?&page=1&managed_by=${userId}`,{
          method:"GET"
        }
      )
      .then(res=>res.json())
      .then((data ) => {
       setShops(data.shopdata);
        setPagiNationData(data.paginateData);
      })
      .catch((e) => {
        console.log(e);
        setPagiNationData({});
      });
    }
  };
  useEffect(() => {
    setIsLoading(true);
    if (username === null ||(role!=="0" && role!=='3')) {
      localStorage.clear();
      navigate("/");
    }
    fetch(`http://localhost:5000/paginated-shops?page=1&managed_by=${userId}`, {
      method: "GET",
      headers: {
        "content-type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setShops(data.shopdata);
        setPagiNationData(data.paginateData);
        setIsLoading(false);
    });

    fetch("http://localhost:5000/district", {
      method: "GET",
      headers: {
        "content-type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => setDistrict(data));

    fetch("http://localhost:5000/subdistrict", {
      method: "GET",
      headers: {
        "content-type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => setSubD(data));

    fetch("http://localhost:5000/thana", {
      method: "GET",
      headers: {
        "content-type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) =>{
        setThana(data)        
        setIsLoading(false)
      });
  }, [username, role, navigate,userId]);
  return (
    <div>
      <div className="text-center">
        <p className="text-4xl font-bold mb-4">Shops</p>
      </div>
      {isLoading && <Loader></Loader>}
      <div className='overflow-x-auto w-full'>
            <table className='mx-auto   w-full whitespace-nowrap rounded-lg bg-white divide-y  overflow-hidden'>
          <thead >
            <tr>
              <th>Shop Name</th>
              <th>Contact Number</th>
              <th>Owner Name</th>
              <th>Division</th>
              <th>District</th>
              <th>Upozilla/Thana</th>
            </tr>
          </thead>
          <tbody>
            {shops.length > 0 &&
              shops.map((it) => (
                <tr key={it._id}>
                  <td>{it.shop_name}</td>
                  <td>{it.contact_no}</td>
                  <td>{it.owner_name}</td>
                  <td>{it.division}</td>
                  <td>
                    {district.length > 0 &&
                      district.filter((ds) => ds.value === it.district_id)[0]
                        .label}
                  </td>
                  <td>
                    {
                    it.thana? (thana?.length>0 && thana?.filter(th=>th.value===it.thana)[0]?.label) : (subD?.length>0 && subD?.filter(sub=>sub.value===it.subdistrict)[0].label)
                    
                    }
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <div className="my-6 pr-0 lg:pr-10">
          {pagiNationData && (<Pagination pageCount={pagiNationData.totalPages} currentPage={pagiNationData.currentPage} handlePageClick={(e) => handlePageClick(e)} />)}
        </div>
    </div>
  );
};

export default ShowShops;
