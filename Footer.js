import React, { useState } from "react";
import '../css/Footer.css'; // Import the CSS file
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, DialogContentText } from '@mui/material';
import { Construction } from '@mui/icons-material';

const Footer = () => {

    const [open, setOpen] = useState(false);

    const handleClose = () => {
        setOpen(false);
    };

    const handleLinkClick = (e) => {
        e.preventDefault();
        setOpen(true);
    };

    return (
        <>
            <footer className="footer">
                <div className="footer-container">
                    {/* Left Section - App Download */}
                    <div className="footer-section">
                        <h3>Download Our App</h3>
                        <p>Order delicious food from anywhere with our mobile app.</p>
                        <div className="download-buttons">
                            <a href="https://play.google.com/store/apps" target="_blank" rel="noopener noreferrer">
                                <img
                                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Google_Play_Store_badge_EN.svg/512px-Google_Play_Store_badge_EN.svg.png"
                                    alt="Google Play"
                                    width="150"
                                />
                            </a>
                        </div>
                    </div>

                    {/* Middle Section - Restaurant Branding */}
                    <div className="footer-section">
                        <h2 className="footer-logo">
                            <span className="red-text">DEV</span>LOK
                        </h2>
                        <p className="footer-purpose">
                            <b style={{ fontSize: '20px' }}>Your happiness, our recipe!</b>
                            <br /><br />
                            Bringing the best flavors to your table with fresh ingredients and love.
                        </p>
                    </div>

                    {/* Right Section - Useful Links */}
                    <div className="footer-section">
                        <h3>Useful Links</h3>
                        <ul>
                            <li><a href="/menu">Menu</a></li>
                            <li onClick={handleLinkClick}><a href="#">Join as Chef</a></li>
                            <li onClick={handleLinkClick}><a href="#">Privacy Policy</a></li>
                            <li onClick={handleLinkClick}><a href="#">Send Feedback</a></li>
                        </ul>
                    </div>

                    {/* Social Media */}
                    <div className="footer-section">
                        <h3>Follow us</h3>
                        <ul>
                            <li onClick={handleLinkClick}><a href="#">Twitter</a></li>
                            <li onClick={handleLinkClick}><a href="#">YouTube</a></li>
                            <li onClick={handleLinkClick}><a href="#">Facebook</a></li>
                            <li onClick={handleLinkClick}><a href="#">Instagram</a></li>
                        </ul>
                    </div>
                </div>

                {/* Copyright Section */}
                <div className="footer-bottom">
                    <p>Copyright 2025 - DevLok</p>
                </div>

                {/* Subscribe Button */}
                {/* <div className="subscribe-button">
        <button>
          <span className="play-icon">▶</span> Subscribe
        </button>
      </div> */}
            </footer>
            <Dialog open={open} onClose={handleClose} PaperProps={{
                style: { width: '370px', backgroundColor: '#f0f8ff', borderRadius: '10px', padding: '18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', },
            }}>
                <DialogTitle>
                    <Construction style={{ color: '#f44336', fontSize: '2rem', verticalAlign: 'middle' }} />
                    <Typography variant="h6" component="span" style={{ marginLeft: '10px' }}>
                        Under Construction
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        <Typography variant="body1" style={{ fontWeight: 500, color: '#444' }}>
                            This section is currently under development. Please check back later for updates.
                        </Typography>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} variant="contained" color="primary" style={{ backgroundColor: '#1976d2' }}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default Footer;
