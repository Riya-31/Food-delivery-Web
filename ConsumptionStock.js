import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from '../config';
import '../css/consumption.css';
import { AiOutlineSearch } from "react-icons/ai";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { IoHome } from "react-icons/io5";

const ConsumptionPage = () => {
    const [inventory, setInventory] = useState([]);
    const [consumption, setConsumption] = useState({});
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [showMenu, setShowMenu] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    // Detect screen size changes
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768); // Hide buttons on small screens
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);


    // Item fetch from the backend
    const fetchData = async () => {
        try {
            const response = await fetch(`${BASE_URL}/api/stock/fetchstockitem`);
            if (!response.ok) {
                throw new Error('Failed to fetch Data');
            }
            const fetchedData = await response.json();
            setInventory(fetchedData);

        } catch (err) {
            console.error(err);
            toast.error('Failed to fetch data. Please try again');
        }
    };
    useEffect(() => {
        fetchData();
    }, []);

    const handleConsumptionChange = (id, value) => {
        setConsumption({ ...consumption, [id]: value });
    };


    const submitConsumption = async () => {
        try {
            const promises = Object.entries(consumption).map(async ([itemId, quantityConsumed]) => {
                const item = inventory.find(item => item._id === itemId); // ✅ Find item in inventory
                if (!item) return; 
                const response = await fetch(`${BASE_URL}/api/consumption/addconsumption`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        itemId,
                        itemName: item.name,
                        quantityConsumed: Number(quantityConsumed), // Convert input to number
                        quantityUnit: inventory.find(item => item._id === itemId)?.quantityUnit || ""
                    })
                });

                if (!response.ok) throw new Error(`Failed to add consumption for item ${itemId}`);
                return response.json();
            });

            await Promise.all(promises);
            toast.success("Consumption added successfully!");
            fetchData(); // Refresh inventory after update
        } catch (err) {
            console.error(err);
            toast.error("Failed to add new consumption");
        }
    };

    const filteredInventory = inventory.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    function gotoinventory() {
        window.location.href = '/stock';
    }
    function gotoadmin() {
        window.location.href = '/adminHomePage';
    }


    return (
        <div>
            <ToastContainer position="top-right" autoClose={2000} color="#5E1E42" />
            <nav className="con-stock-navbar">
                <h1 className="con-nav-heading">Restaurant Inventory System </h1>
                {error && <p className="error">{error}</p>}
                <div className="con-stock-nav-rightside" style={{ display: 'flex' }} >
                    <div className="con-stock-search-container" >
                        <input
                            type="text"
                            placeholder="Search items..."
                            className="con-stock-search-input"
                            // style={{ padding: '10px 10px 10px 10px', borderRadius: '12px', marginRight: '10px', marginTop: '-1px' }}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {/* <AiOutlineSearch className="con-stock-search-icon"  /> */}
                    </div>
                    <div className="con-stock-nav-button">
                        {!isMobile ? (
                            <>
                                <button style={{ margin: '0px 4px 4px 15px' }} onClick={gotoinventory}> <strong>Inventory</strong> </button>
                                <button style={{ margin: '0px 4px 0px 12px', padding: '4px 8px 6px 7px', fontSize: '18px' }} onClick={gotoadmin}><strong>  <IoHome style={{ color: '#5E1E42' }} /></strong></button>
                            </>
                        ) : (
                            <div className="menu-container">
                                <button className="menu-button" onClick={() => setShowMenu(!showMenu)}>{showMenu ? "×" : "⋮"}</button>
                                {showMenu && (
                                    <div className="dropdown-menu">
                                        <button onClick={gotoinventory}> <strong>Inventory</strong> </button>
                                        <button onClick={gotoadmin}><strong>  Home </strong></button>
                                    </div>
                                )}

                            </div>
                        )}
                    </div>
                </div>
            </nav >
            <div className="consumption-container">
                <h2 style={{ color: '#5E1E42' }}>CONSUMPTION ENTRY</h2>
                <table className="con-table">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Available Stock</th>
                            <th>Consumed</th>
                            <th>Submit</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredInventory.map(item => (
                            <tr key={item._id}>
                                <td>{item.name}</td>
                                <td>{item.remainingStock} {item.quantityUnit}</td>
                                <td>
                                    <input
                                        className="con-input"
                                        type="number"
                                        min="0"
                                        value={consumption[item._id] || ""}
                                        onChange={(e) => handleConsumptionChange(item._id, e.target.value)}
                                    />
                                    &nbsp; {item.quantityUnit}
                                </td>
                                <td><button className="con-button " onClick={submitConsumption}>Submit</button> </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

            </div>
        </div >
    );
};

export default ConsumptionPage;
