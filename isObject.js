/**
 * Utility function to check if variable is an object
 *
 * @param {object}  value - Any variable whose value will be tested to be an object
 * @param {boolean}  includeArray - Boolean to check whether we want to include arrays as objects
 */
const isObject = (value, includeArray) => {
	// Check for [object Array] and [object Object]
  	if (includeArray) {
    	return (
      		Object.prototype.toString.call(value) === "[object Object]" ||
     		 Object.prototype.toString.call(value) === "[object Array]"
    	)
  	}

  	return Object.prototype.toString.call(value) === "[object Object]"
}

export default isObject
