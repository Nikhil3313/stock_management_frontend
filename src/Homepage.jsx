import axios from 'axios'
import React, { useEffect, useState, useRef } from 'react'
import ReactSelect from 'react-select'

function Homepage() {

  const [popup, setPopup] = useState(false)
  const [userData, setuserData] = useState([])
  const [selectedOption, setSelectedOption] = useState(null)
  const [modifiedData, setModifiedData] = useState([])
  const [data, setData] = useState({
    name: "",
    price: "",
    quantity: "",
    unit: "",
    type: "Damage",
    sku: ""
  })


  const changeHandler = (e) => {
    const { name, value } = e.target;
      setData({
        ...data,
        [name]: value
      })
  }

  const submitHandler = (e) => {
    e.preventDefault();

      if (!selectedOption) {
        alert("Please select a product");
        return;
      }
      if (!data.quantity.trim() || isNaN(data.quantity) || parseInt(data.quantity) <= 0) {
        alert("Please enter a valid quantity");
        return;
      }
      ModifyStock(data)
    }

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/products/getAll")
      .then((res) => {
        setuserData(res.data);
      })
      .catch((err) => {
        console.log(err)
      })
  }, [])


  const getData = () => {
    axios
      .get("http://localhost:5000/api/stock")
      .then((res) => {
        // console.log(12122, res.data)
        setModifiedData(res.data)
      })
      .catch((err) => {
        console.log(err)
      })
  }
  useEffect(() => {
    getData()
  }, [])

  const handleSelectChange = (selectedOption) => {
    setSelectedOption(selectedOption);
    setData({
      ...data, price: selectedOption.value,
      name: selectedOption.label,
      sku: selectedOption.sku
    });
  }

  const viewForm = () => {
    setData(
      {
        name: "",
        price: "",
        quantity: "",
        unit: "",
        type: "Damage",
        sku: ""
      }
    )
    setSelectedOption(null)
    getData()
    setPopup(!popup);
  }


  const ModifyStock = (data) => {

    axios.post("http://localhost:5000/api/stock/add", data).then((res) => {
      console.log("res", res.data.data)
      setPopup(!popup)
      setData(
        {
          name: "",
          price: "",
          quantity: "",
          unit: "",
          type: "Damage",
          sku: ""
        }
      )
      setSelectedOption(null)
      getData()
    })
  }

  const dateSeter = (date) => {
    const monthLater = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const d = new Date(date);
    const year = d.getFullYear();
    const month = d.getMonth();
    const day = d.getDate();
    return (` ${day} ${monthLater[month]} ${year}`);
  };

  const updateProduct = (item) => {
    setPopup(true);
    setData({
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      unit: item.unit,
      type: item.type,
      sku: item.sku
    });
    const foundProduct = userData.find(data => data.sku == item.sku)
    setSelectedOption({ label: foundProduct.name, value: foundProduct.mrp, sku: foundProduct.sku })

  };

  const deleteProduct = (productId) => {
    axios.delete(`http://localhost:5000/api/stock/${productId}`)
      .then((res) => {
        console.log("Product deleted successfully:", res.data);
        getData();
      })
      .catch((err) => {
        console.error("Error deleting product:", err);
      });
  };
  const [isOpen, setIsOpen] = useState(false);
  const [filterisOpen, setfilterIsOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState('');
  const [selectedFilterOption, setSelectedFilterOptions] = useState('')

  const options = ["Quantity", "Price", "Time"];
  const filterOptions = ["All", "Damage", "Loose"];

  const handleFilterOption = (filterOptions) => {
    setSelectedFilterOptions(filterOptions)
    setfilterIsOpen(false)
  }

  const handleOptionClick = (option) => {
    setSelectedOptions(option);
    setSelectedFilterOptions("All")
    setIsOpen(false);
  };

  const filteredAndSortedData = modifiedData

    .sort((a, b) => {
      if (selectedOptions === 'Quantity') {
        return a.quantity - b.quantity;
      }  else if (selectedOptions === 'Price') {
        return a.price - b.price;
      }
      else if (selectedOptions === 'Time') {
        return new Date(a.updatedAt) - new Date(b.updatedAt);
      }

      return 0;
    }
    )

    .filter(item => {

      if (selectedFilterOption === 'Damage' || selectedFilterOption === 'Loose') {
        return item.type === selectedFilterOption
      } else if (selectedFilterOption === 'All') {
        return modifiedData
      }


      return modifiedData
    });

  // const filter =  filteredAndSortedData.map((e) => filteredAndSortedData.type == e.target)

  const taskRef = useRef(null);

  const handleOutsideClick = (event) => {
    if (taskRef.current && !taskRef.current.contains(event.target)) {
      setfilterIsOpen(false);
      setIsOpen(false);
    }
  };
  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  return (
    <>
      <div className="p-5 flex flex-col gap-6 w-[100%]">
        <div className="flex flex-row font-[600] justify-between">
          <div className="text-[18px]">All Products : {filteredAndSortedData.length}</div>
          <div className="flex gap-[20px] text-[14px]">
            <button className=" relative font-semibold border border-gray-400 py-2 px-4 rounded-[5px] " onClick={() => setIsOpen(!isOpen)}> {selectedOptions ? selectedOptions : "Sort By"}
              {isOpen && (
                <div ref={taskRef} className="absolute z-10 mt-3 left-0 bg-white border border-gray-300 rounded">
                  {options.map((option, index) => (
                    <div key={index} className="py-1 px-4 cursor-pointer hover:bg-gray-100" onClick={() => handleOptionClick(option)}>{option}</div>
                  ))}
                </div>
              )}
            </button>
            <button className="relative font-semibold border border-gray-400 py-2 px-4 rounded-[5px] " onClick={() => setfilterIsOpen(!filterisOpen)}> {selectedFilterOption ? selectedFilterOption : "Filter By"}
              {filterisOpen && (
                <div ref={taskRef} className="absolute z-10 mt-3 bg-white border border-gray-300 rounded">
                  {filterOptions.map((option, index) => (
                    <div key={index} className="py-1 px-4 cursor-pointer hover:bg-gray-100" onClick={() => handleFilterOption(option)}>{option}</div>
                  ))}
                </div>
              )}
            </button>

            <button className='bg-[#34ebb1] py-[5px] px-[10px] rounded-[10px] text-[white]' onClick={viewForm}>+ Add New Product</button>
          </div>
        </div>

        <div className='flex flex-col  text-center w-[100%]'>
          <div className='w-[100%] py-[10px] bg-[#71c3e3] rounded-[5px] text-[18px] flex flex-row gap-[10px]'>
            <p className='w-[5%] font-[600]'>Sr No</p>
            <p className='w-[32%] font-[600]'>Product Name</p>
            <p className='w-[8%] font-[600]'>Quantity</p>
            <p className='w-[9%] font-[600]'>Unit</p>
            <p className='w-[9%] font-[600]'>Price</p>
            <p className='w-[7%] font-[600]'>Remark</p>
            <p className='w-[18%] font-[600]'>Time</p>
          </div>
          {
            filteredAndSortedData?.map((item, index) => (
              <>

                <div className='w-[100%] border-[1px] py-[10px] text-[14px] text-center flex overflow-y-auto flex-row gap-[10px]'>
                  <p className='w-[5%]  font-[600]'>{index + 1}</p>
                  <p className='w-[40%]  font-[600]'>{item.name}</p>
                  <p className='w-[10%]  font-[600]'>{item.quantity}</p>
                  <p className='w-[10%]  font-[600]'>{item.unit}</p>
                  <p className='w-[10%]  font-[600]'>{item.price}</p>
                  <p className='w-[10%]  font-[600]'>{item.type}</p>
                  <p className='w-[20%]  font-[600]'>{dateSeter(item.updatedAt)}</p>
                  <button className='bg-[#67eb8a] rounded-[5px] text-[white] px-[8px] py-[4px]' onClick={() => { updateProduct(item) }} >Update</button>
                  <button className='bg-[red] rounded-[5px] text-[white] px-[8px] py-[4px]' onClick={() => deleteProduct(item._id)}>Delete</button>
                </div>
              </>
            ))}

        </div>

        {
          popup &&
          <>
            <div className="fixed z-[2000] top-0 left-0 right-0 bottom-0 bg-black opacity-60"></div>
            <div className="fixed z-[2000] top-[40%] left-0 right-0  flex items-center justify-center  ">
              <div className=" absolute w-[40%] rounded-[16px] bg-white shadow-lg pt-[20px] pb-6 px-11 flex flex-col gap-6  ">
                <div className='flex flex-col  gap-[20px] w-[100%]'>
                  <div className='flex w-[100%] justify-between'>
                    <p className='font-[500]'>Add Product</p>
                    <button className='text-[white] font-[500] bg-[red] rounded-[8px] px-[20px] py-[5px]' onClick={viewForm}>Close</button>
                  </div>
                  <label htmlFor="mySelect">Product</label>
                  <ReactSelect
                    id='mySelect'
                    value={selectedOption}
                    onChange={handleSelectChange}
                    options={userData.map(item => ({ label: item.name, value: item.mrp, sku: item.sku }))}
                    className=' px-[10px] py-[5px] rounded-[5px] w-[100%]'
                    placeholder='Select Product' />
                  <div className='W-[100%] flex min-gap-[10%] flex-row justify-between'>
                    <div className='flex flex-col w-[45%] gap-[20px]'>
                      <p className='font-[500]'>Price</p>
                      {selectedOption ? <p>{selectedOption.value}</p> : " 00"}
                    </div>
                    <div className='flex flex-col w-[45%] gap-[20px]'>
                      <p className='font-[500]'>Quantity</p>
                      <input type="number" placeholder='Enter Quantity' name='quantity' value={data.quantity} onChange={changeHandler} className='border-[1px] px-[10px] py-[5px] rounded-[5px]' />
                    </div>
                  </div>

                  <div className='W-[100%] flex min-gap-[10%] flex-row justify-between'>
                    <div className='flex flex-col w-[45%] gap-[20px]'>
                      <p className='font-[500]'>Unit</p>
                      <input type="text" placeholder='Enter Unit' name='unit' onChange={changeHandler} value={data.unit} className='border-[1px] px-[10px] py-[5px] rounded-[5px]' />
                    </div>
                    <div className='flex flex-col w-[45%] gap-[20px]'>
                      <p className='font-[500]'>Type</p>
                      <select value={data.type} name='type' onChange={changeHandler} className='w-[60%]'>
                        <option value="Damage">Damage</option>
                        <option value="Loose">Loose</option>
                      </select>
                    </div>
                  </div>

                  <div className='w-[100%] flex justify-between'>
                    <button className='text-[white] font-[500] bg-[red] rounded-[8px] px-[20px] py-[5px]' onClick={viewForm}>Close</button>
                    <button className='text-[white] font-[500] bg-[green] rounded-[8px] px-[20px] py-[5px]' onClick={submitHandler}>Save</button>
                  </div>
                </div>
              </div>
            </div>

          </>
        }

      </div>
    </>
  )
}

export default Homepage
