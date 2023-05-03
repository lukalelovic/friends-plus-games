app.post('/login', (req, res) => {
    let data = req.body;
    console.log(data);

    // TODO: check user exists in database
    //res.send() // send back 200 or 400 response
});

