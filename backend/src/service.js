const { Injectable } = require('@nestjs/common');

@Injectable()
class AppService {
    getHello() {
        return 'Hello World!';
    }

    getHelloName(name) {
        return `Hello, ${name}!`;
    }
}

module.exports = {
    AppService,
};