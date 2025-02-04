import React from "react"
import { useEffect, useState } from "react"
import axios from "axios"
import { useKeenSlider } from "keen-slider/react"
import "keen-slider/keen-slider.min.css"
import "./styles.css"

const ProductCarousal = ({selectedItem, setSelectedItem, type}) => {
  const [sliderRef] = useKeenSlider({
    loop: true,
    mode: "free",
    slides: {
      perView: 4,
      spacing: 15,
    },
  })

  const [cloths, setCloths] = useState([]);

  useEffect(() => {
      const getCloths = async () => {
          try {
              const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/cloth/getallcloths`);
              setCloths(response.data.cloths);
            } catch (error) {
              console.error("Error fetching data:", error);
            }              
      };
      getCloths();
  }, []);

  const [nameQuery, setNameQuery] = useState("");
  const [typeQuery, setTypeQuery] = useState("");
  const [colorQuery, setColorQuery] = useState("");

  const filteredCloths = cloths.filter((cloth) => {
        const clothNameMatch = cloth.name.toLowerCase().includes(nameQuery.toLowerCase());
        const clothTypeMatch = cloth.type.toLowerCase().includes(typeQuery.toLowerCase());
        const clothColorMatch = cloth.color.toLowerCase().includes(colorQuery.toLowerCase());

        return (clothNameMatch && clothTypeMatch && clothColorMatch);
  })


  const filteredProducts = filteredCloths.filter((cloth) => {
      if (cloth.productType == 'coat' && (type == 'Three Piece Suit' || type == 'Two Piece Suit' || type == 'Waist Coat' || type == 'Pant'))
      {
        return true;
      } else if (cloth.productType == 'shirt' && type == 'Shirt') {
        return true;
      } else if (cloth.productType == 'qameez suit' && type == 'Shalwar Suit')
      {
        return true;
      }
  })

  const setItem = (item) => {
    setSelectedItem(item);
    setNameQuery(item.name);
    setColorQuery(item.color);
    setTypeQuery(item.type);
  }

  return (
    <div className="flex flex-col w-full gap-10">
        <div className='flex flex-row gap-5'>
            <div className='flex flex-col gap-1'>
                <label>Name</label>
                <input type='text' value={nameQuery} onChange={(e) => setNameQuery(e.target.value)} className='w-[300px] p-1 border-[1px] border-gray-500  rounded'/>
            </div>
            <div className='flex flex-col gap-1'>
                <label>Type</label>
                <input type='text' value={typeQuery} onChange={(e) => setTypeQuery(e.target.value)} className='w-[300px] p-1 border-[1px] border-gray-500  rounded'/>
            </div>
            <div className='flex flex-col gap-1'>
                <label>Color</label>
                <input type='text' value={colorQuery} onChange={(e) => setColorQuery(e.target.value)} className='w-[300px] p-1 border-[1px] border-gray-500  rounded'/>
            </div>
        </div>
        <div ref={sliderRef} className="flex flex-row max-w-full gap-3 overflow-auto overflow-y-hidden">
            {
                filteredProducts && filteredProducts.map((product) =>       
                    <div className="">
                        <img src={product.coverImage} className="transition-all duration-200 max-w-[200px] min-w-[200px] max-h-[200px] rounded cursor-pointer hover:scale-105" onClick={() => setItem(product)} />
                    </div>
                )
            }

        </div>
    </div>
  )
}

export default ProductCarousal;