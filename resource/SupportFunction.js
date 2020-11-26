import {apiUrl, rc_success, rq_get_product} from './BaseValue';

export function makeAPostRequest(
  requestObject,
  showLoadingBarFunction,
  closeLoadingBarFunction,
  callback,
) {
  showLoadingBarFunction();
  console.log(requestObject);
  fetch(apiUrl, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestObject),
  })
    .then((response) => response.json())
    .then((responseJson) => {
      console.log(responseJson);
      closeLoadingBarFunction();
      if (responseJson.rc == rc_success) {
        callback(true, responseJson);
      } else {
        callback(false, responseJson.message);
      }
    })
    .catch((error) => {
      closeLoadingBarFunction();
      callback(false, error);
    });
}
