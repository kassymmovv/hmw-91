const mongoose = require('mongoose');
const config = require('./config');
const {nanoid} = require('nanoid');

const User = require('./models/User');

const run = async () => {
    await mongoose.connect(config.database, config.databaseOptions);

    const collections = await mongoose.connection.db.listCollections().toArray();

    for (let coll of collections) {
        await mongoose.connection.db.dropCollection(coll.name);
    }

    await User.create({
        username: 'admin',
        password: '123',
        token: nanoid(),
        role: 'admin'
    }, {
        username: 'user',
        password: '123',
        token: nanoid()
    });


    mongoose.connection.close();
};

run().catch(e => {
    mongoose.connection.close();
    throw e;
});