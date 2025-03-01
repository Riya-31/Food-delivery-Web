import React from "react";
import "../css/Home.css";
import { useNavigate } from "react-router-dom";

const MenuPage = () => {
  const navigate = useNavigate();

  const handleExploreClick = () => {
    navigate("/menu");
  };

  const imageGroups = [
    {
      title: "Starters",
      images: [
        "/starters/image1.jpg",
        "/starters/image2.jpg",
        "/starters/image3.jpg",
        "/starters/image4.jpg",
        "/starters/image5.jpg",
      ],
    },
    {
      title: "Main Course",
      images: [
        "/maincourse/image1.jpg",
        "/maincourse/image2.jpg",
        "/maincourse/image3.jpg",
        "/maincourse/image4.jpg",
        "/maincourse/image5.jpg",
      ],
    },
    {
      title: "Desserts",
      images: [
        "/deserts/image1.jpg",
        "/deserts/image2.jpg",
        "/deserts/image3.jpg",
        "/deserts/image4.jpg",
        "/deserts/image5.jpg",
      ],
    },
  ];


  return (
    <div className="App">
      <h1 className="headM">
        <img src="/images/8-removebg-preview.png" alt="Devlok Food Street and Resort" style={{ width: "200px", height: "", cursor: "pointer", marginTop: '7px' }} />
      </h1>
      {/* <div className="marquee">
  <p>🍝 𝙒𝙝𝙚𝙧𝙚 𝙩𝙝𝙚 𝙩𝙖𝙨𝙩𝙚 𝙤𝙛 𝙩𝙝𝙚 𝙢𝙤𝙪𝙣𝙩𝙖𝙞𝙣𝙨 𝙢𝙚𝙚𝙩𝙨 𝙩𝙝𝙚 𝙨𝙤𝙪𝙡 𝙤𝙛 𝙝𝙤𝙨𝙥𝙞𝙩𝙖𝙡𝙞𝙩𝙮 🍝</p>
</div> */}

      <section className="hero">
        <img src="/images/5-removebg-preview.png" alt="Restaurant Logo" className="logo-image" />
        <img src="/images/10-removebg-preview.png" alt="Welcome Text" className="welcome-text-image" />
        {/* <h2 className="headBox">Taste the Adventure</h2> */}
        <h2>Experience Flavourful Creations</h2>
        <button className="explore-btn" onClick={handleExploreClick}>
          Explore Menu
        </button>
      </section>

      <section className="content-section">
        <img src="/images/image2of5.jpg" alt="Decorative Image" className="decorative-image1" />
        <img src="/images/image1of5.jpg" alt="Decorative Image" className="decorative-image2" />
        <img src="/images/image3of5.jpg" alt="Decorative Image" className="decorative-image3" />
        <img src="/images/image4of5.jpg" alt="Decorative Image" className="decorative-image4" />
        <img src="/images/image5of5.jpg" alt="Decorative Image" className="decorative-image5" />
        <img src="/images/specailities-image.png" alt="Decorative Image" className="decorative-image6" />

      </section>

      <section className="specialities1">
        {imageGroups.map((group, index) => (
          <div className="containerry">
            <div className="image-containerry" key={index}>
              <div className="image-wrap">
                {group.images.map((image, idx) => (
                  <img src={image} alt={`Speciality ${idx + 1}`} key={idx} />
                ))}
              </div>
            </div>
            <h3 className="image-title">{group.title}</h3>
          </div>
        ))}
      </section>



      {/* <section className="menu">
        <h2>Our Specialties</h2>
        <div className="menu-items">
          <div className="menu-card">
            <img src="/images/burger.jpg" alt="Grilled Steak" />
            <h3>BiteMyBurger</h3>
          </div>
          <div className="menu-card">
            <img src="/images/icecream.jpg" alt="Fresh Salad" />
            <h3>Creamed Bliss</h3>
          </div>
          <div className="menu-card">
            <img src="/images/pizza.jpg" alt="Mountain Dessert" />
            <h3>TheSaucySlice</h3>
          </div>
        </div>
      </section> */}

      <footer className="footerr">
        <p>&copy; 2025 Taste the Adventure. All rights reserved.</p>
      </footer>
    </div>

  );
};

export default MenuPage;