function OrdersContent() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            setError("");
            try {
                const date = new Date().toISOString().split("T")[0]; // Today's date
                const response = await fetch(`${BASE_URL}/api/admin/fetchOrderByDate?date=${date}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch orders");
                }
                const data = await response.json();
                console.log("Data = ", data);
                setOrders(data.orders || []);
            } catch (err) {
                setError("Error fetching orders. Please try again later.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    return (
        <Box sx={{ py: 4 }}>
            <Typography variant="h6" gutterBottom>
                Orders
            </Typography>
            {loading ? (
                <CircularProgress />
            ) : error ? (
                <Typography color="error">{error}</Typography>
            ) : orders.length > 0 ? (
                <Grid container spacing={2}>
                    {orders.map((order) => (
                        <Grid item xs={12} sm={6} md={3} key={order._id}>
                            <Paper sx={{ padding: 2, boxShadow: 3, borderRadius: '8px' }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', marginBottom: 1 }}>
                                    Order ID: {order.orderId}
                                </Typography>
                                <Typography variant="body2" color="textSecondary" sx={{ marginBottom: 1 }}>
                                    Total Amount: ₹{order.totalAmount} | Status: {order.orderStatus === 0 ? "Pending" : "Completed"}
                                </Typography>
                                <Typography variant="body2" color="textSecondary" sx={{ marginBottom: 2 }}>
                                    Mode of Payment: {order.modeOfPayment} | Order Type: {order.type}
                                </Typography>

                                <List>
                                    {order.items.map((item, index) => (
                                        <ListItem key={index} sx={{ padding: '6px 0' }}>
                                            <ListItemText
                                                primary={`${item.name} ${item.measurement ? ` ${item.measurement}` : ''} x ${item.quantity}`}
                                                secondary={`Price: ₹${item.price}`}
                                                sx={{ marginBottom: 0 }}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Typography>No orders found for today.</Typography>
            )}
        </Box>
    );
}

export default OrdersContent;