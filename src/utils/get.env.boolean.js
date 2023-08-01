const allowedValues = ['true', 'false'];

export default ( name, defaultValue ) => {
    let result = defaultValue;

    if ( name in process.env ) {
        const value = process.env[name].trim().toLowerCase();

        if ( allowedValues.includes(value) ) {
            result = value === 'true';
        } else {
            console.error(`process.env.${name} got an invalid value "${value}"`);
        }
    }

    return result;
};
