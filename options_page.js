window.onload = function () {
  const schema = {
    extensionData: {
      $type: "array",
      $nullable: false,
      $minLength: 0,
      $maxLength: 100000,
      $item: {
        $type: "object",
        $nullable: false,
        $value: {
          name: {
            $type: "string",
            $minLength: 1,
            $maxLength: 100000,
          },
          urls: {
            $type: "array",
            $nullable: false,
            $minLength: 0,
            $maxLength: 100000,
            $item: {
              $type: "string",
              $minLength: 1,
              $maxLength: 100000,
            },
          },
        },
      },
    },
  };

  var localExtensionData = [];

  chrome.storage.sync.get("extensionData", function (storage) {
    const { extensionData = [] } = storage;
    localExtensionData = extensionData;

    const getData = document.getElementById("getData");
    const makeBulkUpload = document.getElementById("makeBulkUpload");
    const submitHostname = document.getElementById("submitHostname");
    if (Rx) {
      const getData$ = Rx.Observable.fromEvent(getData, "click");
      const makeBulkUpload$ = Rx.Observable.fromEvent(makeBulkUpload, "click");
      const submitHostname$ = Rx.Observable.fromEvent(submitHostname, "click");
      makeBulkUpload$.subscribe((event) => {
        event.preventDefault();
        const bulkUploadNode = document.getElementById("bulkUpload");
        const bulkUpload = bulkUploadNode.value;
        if (bulkUpload) {
          var bulkUploaderElement = JSON.parse(bulkUpload);
        }

        try {
          var validatedJson = YomJsonValidator.validate(schema, {
            extensionData: bulkUploaderElement,
          });

          validatedJson = [
            ...localExtensionData,
            ...validatedJson.extensionData,
          ];



          const strippedData = {};

          validatedJson.map((element) => {
            strippedData[element.name] = [
              ...new Set([
                ...(strippedData[element.name] || []),
                ...element.urls,
              ]),
            ];
          });

          validatedJson = Object.entries(strippedData).map(([key, value]) => {
            return {
              name: key,
              urls: value,
            };
          });

          chrome.storage.sync.set({
            extensionData: validatedJson,
          });
          const alertNode = document.getElementById("alert");
          alertNode.insertAdjacentHTML(
            "beforeend",
            `<div class="alert alert-success" role="alert">Added New Config Successfully</div>`
          );
          bulkUploadNode.value = "";
          setTimeout(function removeAlert() {
            alertNode.innerHTML = "";
          }, 3000);
        } catch (err) {
          const alertNode = document.getElementById("alert");
          alertNode.insertAdjacentHTML(
            "beforeend",
            `<div class="alert alert-danger" role="alert">${err.message}</div>`
          );

          setTimeout(function removeAlert() {
            alertNode.innerHTML = "";
          }, 3000);
        }
      });

      getData$.subscribe((event) => {
        event.preventDefault();
        var isWeHave = true;

        const commonName = document.getElementById("commonName");
        const url = document.getElementById("url");

        if (commonName.value && url.value) {
          localExtensionData = localExtensionData.map((element) => {
            if (element.name == commonName.value) {
              isWeHave = false;
              return {
                ...element,
                name: commonName.value,
                urls: [...new Set([...element.urls, url.value])],
              };
            }
            return element;
          });

          if (isWeHave) {
            localExtensionData = [
              ...localExtensionData,
              { name: commonName.value, urls: [url.value] },
            ];
          }

          chrome.storage.sync.set({
            extensionData: localExtensionData,
          });

          commonName.value = "";
          url.value = "";

          const alertNode = document.getElementById("alert");
          alertNode.insertAdjacentHTML(
            "beforeend",
            `<div class="alert alert-success" role="alert">Added New Entry Successfully</div>`
          );
          setTimeout(function removeAlert() {
            alertNode.innerHTML = "";
          }, 3000);
        }
      });

      submitHostname$.subscribe((event) => {
        event.preventDefault();
        const defaultHostnameNode = document.getElementById("hostname");
        const defaultHostname = defaultHostnameNode.value;
        chrome.storage.sync.set(
          {
            defaultHostname,
          },
          function () {
            defaultHostnameNode.value = "";
          }
        );
      });
    }
  });
};
