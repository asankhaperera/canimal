let AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient();
const Alexa = require("ask-sdk");

const LaunchRequest_Handler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
        const responseBuilder = handlerInput.responseBuilder;

        let say = 'Welcome to my Chinese Animal Game';
        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const request = handlerInput.requestEnvelope.request;
        console.log(`Error handled: ${error.message}`);
        // console.log(`Original Request was: ${JSON.stringify(request, null, 2)}`);

        return handlerInput.responseBuilder
            .speak(`Sorry, your skill got this error.  ${error.message} `)
            .reprompt(`Sorry, your skill got this error.  ${error.message} `)
            .getResponse();
    }
};

const ChineseAnimalIntent_Handler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'ChineseAnimalIntent';
    },
    async handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;

        let year = Number(request.intent.slots.year.value);
        let say = "";

        try {
            let data = await ddb.get({
                TableName: "ChineseAnimal",
                Key: {
                    BirthYear: year
                }
            }).promise();
            say = "Your animal is a " + data.Item.Animal;
            console.log(say);

        } catch (err) {
            console.log(err);
            say = "Sorry I do not know your Chinese animal for the year " + year;
        };


        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

let skill;

exports.handler = async (event) => {

    console.log(`REQUEST++++${JSON.stringify(event)}`);
    if (!skill) {
        skill = Alexa.SkillBuilders.custom().addRequestHandlers(
            ChineseAnimalIntent_Handler,
            LaunchRequest_Handler,
        )
            .addErrorHandlers(ErrorHandler)
            .create();
    }

    const response = await skill.invoke(event);
    console.log(`RESPONSE++++${JSON.stringify(response)}`);

    return response;
};