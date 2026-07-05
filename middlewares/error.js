// Error handling middleware
app.use((err, req, res, next) => {
    let {statusCode = 500, message = "SomeThing Went Wrong"} = err;
    console.error(err);
    res.status(statusCode).render("error.ejs", {message});
});