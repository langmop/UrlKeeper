window.onload = function () {
  function getSubscription({ eventRef, eventName, observer }) {
    const observable$ = Rx.Observable.fromEvent(eventRef, eventName);
    observable$.subscribe(observer.bind(this));
  }

  function getEventAttached({
    elementIdentifier,
    selectorType,
    eventName,
    observer,
  }) {
    var selectedElement;

    switch (selectorType) {
      case "id": {
        selectedElement = document.getElementById(elementIdentifier);
        break;
      }

      case "class": {
        selectedElement = document.getElementById(elementIdentifier);
        break;
      }
    }

    const subscriptionPayload = {
      eventRef: selectedElement,
      eventName,
      observer,
    };

    getSubscription.call({ eventRef: selectedElement }, subscriptionPayload);
  }

  function setDataInMemory({ key, value, callback = () => {} }) {
    chrome.storage.sync.set({ [key]: value }, callback);
  }

  function customSearch({ options, dataSet, searchingTags }) {
    const fuse = new Fuse(dataSet, options);

    return fuse.search({
      $or: searchingTags,
    });
  }

  function getDataFromMemory({ key, callback = () => {} }) {
    chrome.storage.sync.get(key, callback);
  }

  var hostname;
  var searchBar = document.getElementById("search");

  getDataFromMemory({
    key: "defaultHostname",
    callback: function getDefaultHostname(storage) {
      const { defaultHostname = "" } = storage;
      hostname = defaultHostname;
      const hostnameElement = document.getElementById("formGroupExampleInput");
      hostnameElement.value = hostname;
    },
  });
  var suffix = "";

  var sequenceNumber;

  function getSavedSequenceNumber(storage) {
    const { savedSequenceNumber = 1 } = storage;
    sequenceNumber = savedSequenceNumber;
  }

  getDataFromMemory({
    key: "savedSequenceNumber",
    callback: getSavedSequenceNumber,
  });

  function onSearchUpdate(storage) {
    function main(storage) {
      const { extensionData: data = [] } = storage;
      const allBadge = document.querySelectorAll(".badge");
      var searchingTags = [];

      function getPrimarySearchTagData(storage) {
        const { primarySearchTag = [] } = storage;
        searchingTags = primarySearchTag;
      }

      getDataFromMemory({
        key: "primarySearchTag",
        callback: getPrimarySearchTagData,
      });

      if (allBadge) {
        allBadge.forEach((ele) => {
          searchingTags.push({
            name: ele.textContent,
          });
        });
      }

      if (searchBar.value) {
        searchingTags.push({
          name: searchBar.value,
        });
      }

      setDataInMemory({ key: "primarySearchTag", value: searchingTags });

      const options = {
        useExtendedSearch: true,
        includeScore: true,
        keys: ["name"],
      };

      const seached_array = customSearch({
        options,
        dataSet: data,
        searchingTags,
      });

      const accordian_container = document.getElementById("accordion");
      if (accordian_container) {
        accordian_container.remove();
      }

      const accordianBody = document.getElementById("accordian-body");

      accordianBody.insertAdjacentHTML(
        "beforeend",
        '<div class="accordion m-3" id="accordion"></div>'
      );
      seached_array.forEach((ele) => {
        const element = ele.item.name;
        var p = document.getElementById("accordion");
        p.insertAdjacentHTML(
          "beforeend",
          `
            <div class="accordion-item">
              <h2 class="accordion-header" id="heading${element}">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${element}" aria-expanded="false" aria-controls="collapse${element}">
                  ${element.replaceAll("-", " ")}
                </button>
              </h2>
              <div id="collapse${element}" class="accordion-collapse collapse" aria-labelledby="heading${element}" data-bs-parent="#accordion">
              <div>  
              <div class="input-group search m-3 search-container">
                  <div id="search-div" type="text" class="form-control d-flex" placeholder="Search Common Name"
                      aria-label="Recipient's username" aria-describedby="basic-addon2">
                      <div id="secondary-tag-badge${element}" class="d-flex">
                      </div>
                      <input id="secondarySearch${element}" type="text" class="form-control shadow-none border-0" placeholder="Search Common Name"
                      aria-label="Recipient's username" aria-describedby="basic-addon2">
                  </div>
                  <div class="input-group-append">
                      <span id="secondaryAddTag${element}" class="input-group-text rounded-0 h-100">Add Tag</span>
                  </div>
                </div>
                </div>
                <button id="secondary-clear-all${element}" class="btn btn-danger clear-all" type="button" > clear </button>
                <div class="accordion-body">
                  <div class="list-group" id="links${element}">
                  </div>
                </div>
              </div>
            </div>
            `
        );

        const secondarySearchBar = document.getElementById(
          `secondarySearch${element}`
        );

        const secondaryTagBadge = document.getElementById(
          `secondary-tag-badge${element}`
        );

        function secondaryAddTagFunction() {
          if (secondarySearchBar.value) {
            secondaryTagBadge.insertAdjacentHTML(
              "beforeend",
              `<button disabled type="button" class="btn btn-warning secondary-badge">${secondarySearchBar.value}</button>`
            );
            secondarySearchBar.value = "";
          }
        }

        getEventAttached({
          elementIdentifier: `secondaryAddTag${element}`,
          selectorType: "id",
          eventName: "click",
          observer: secondaryAddTagFunction,
        });

        const activeLinks = data.find((temp) => temp.name == element);
        function updateUrlsOnSearch(onSearch = false , onPageChange = true ) {
          const modifiedSearchArray = activeLinks.urls.map((element) => {
            return { url: element };
          });

          const secondaryAllBadge =
            document.querySelectorAll(".secondary-badge");
          const secondarySearchingTags = [];

          const secondaryOptions = {
            useExtendedSearch: true,
            includeScore: true,
            keys: ["url"],
          };

          if (secondaryAllBadge) {
            secondaryAllBadge.forEach((ele) => {
              secondarySearchingTags.push({
                url: ele.textContent,
              });
            });
          }

          if (secondarySearchBar.value) {
            secondarySearchingTags.push({
              url: secondarySearchBar.value,
            });
          }

          function secondaryClearAllFunction() {
            secondaryTagBadge.innerHTML = null;
            secondarySearchingTags = [];
            updateUrlsOnSearch();
          }

          getEventAttached({
            elementIdentifier: `secondary-clear-all${element}`,
            selectorType: "id",
            eventName: "click",
            observer: secondaryClearAllFunction,
          });



          const secondarySeachedArray = customSearch({
            options: secondaryOptions,
            dataSet: modifiedSearchArray,
            searchingTags: secondarySearchingTags,
          });

          const finalSecondarySearch = secondarySeachedArray.map(
            (element) => element.item.url
          );

          const modifiedActiveLinks = {
            ...activeLinks,
            urls: finalSecondarySearch,
          };

          if (secondarySearchingTags.length == 0 && !secondarySearchBar.value) {
            modifiedActiveLinks.urls = activeLinks.urls;
          }

          updateLinkList(
            modifiedActiveLinks.name,
            modifiedActiveLinks.urls,
            activePage,
            onSearch,
            onPageChange
          );
        }

        function updateSecondarySearchBar() {
          updateUrlsOnSearch(true);
        }

        getEventAttached({
          elementIdentifier: `secondarySearch${element}`,
          selectorType: "id",
          eventName: "keyup",
          observer: updateSecondarySearchBar,
        });

        const links = document.getElementById(`links${element}`);

        function updateLinkList(commonName, linkList, activePage, onSearch) {
          links.innerHTML = "";
          let perPageUrls = parseInt(linkList.length / 5);
          activePage = onSearch ? 1 : activePage;
          perPageUrls = perPageUrls < 5 ? 5 : perPageUrls;
          linkList
            .slice((activePage - 1) * perPageUrls, activePage * perPageUrls)
            .forEach((url, index) => {
              links.insertAdjacentHTML(
                "beforeend",
                `<li id=${
                  url + commonName
                } href=${url} class="d-inline-flex justify-content-between list-group-item list-group-item-warning accordian_element_url">
                  <div class="w-100 link_url" id="link_url${url + commonName}">
                    ${url}
                  </div>
                  <div id="copyButton${
                    url + commonName
                  }" class="w-25 d-inline-flex justify-content-center">
                    <button type="button" class="btn btn-success">copy</button>
                  </div>
                </li>`
              );

              getEventAttached({
                elementIdentifier: `${url + commonName}`,
                selectorType: "id",
                eventName: "click",
                observer: function redirectTo() {
                  window.open(hostname + url + suffix);
                },
              });

              getEventAttached({
                elementIdentifier: `copyButton${url + commonName}`,
                selectorType: "id",
                eventName: "click",
                observer: function copyUrl(event) {
                  event.stopPropagation();
                  const copingText = document.getElementById(
                    `link_url${url + commonName}`
                  );
                  navigator.clipboard.writeText(
                    hostname + copingText.textContent + suffix
                  );
                },
              });
            });

          const pageCountPerPage = perPageUrls < 5 ? 5 : perPageUrls;

          const paginationCount =
            parseInt(linkList.length / pageCountPerPage) +
            parseInt(linkList.length % pageCountPerPage == 0 ? 0 : 1);
          links.insertAdjacentHTML(
            "beforeend",
            `<ul class="pagination justify-content-center" id="pagination${element}"></ul>`
          );

          const paginationNode = document.getElementById(
            `pagination${element}`
          );
          paginationNode.innerHTML = "";
          for (let pageCount = 0; pageCount < paginationCount; pageCount++) {
            paginationNode.insertAdjacentHTML(
              "beforeend",
              `<li class="page-item" id=${
                element + pageCount
              } ><a class="page-link" href="#">${pageCount + 1}</a></li>`
            );

            getEventAttached({
              elementIdentifier: `${element + pageCount}`,
              selectorType: "id",
              eventName: "click",
              observer: function updatePaginationPage() {
                updateActivePage(pageCount + 1);
              },
            });
          }
        }
        var activePage = 1;

        const updateActivePage = function (pageNumber) {
          activePage = pageNumber;
          updateUrlsOnSearch();
        };
        updateUrlsOnSearch();
      });
    }
    getDataFromMemory({ key: "extensionData", callback: main });
  }

  getEventAttached({
    elementIdentifier: "formGroupExampleInput",
    selectorType: "id",
    eventName: "keyup",
    observer: function customizedHostNameFunc() {
      hostname = this.eventRef.value || hostname;
      setDataInMemory({key: 'defaultHostname', value: hostname});
    },
  });

  getEventAttached({
    elementIdentifier: "formGroupExampleInput2",
    selectorType: "id",
    eventName: "keyup",
    observer: function customizedHostNameFunc() {
      suffix = this.eventRef.value;
    },
  });

  const tagBadge = document.getElementById("tag-badge");

  function getPrimaryTagFromMemory(storage) {
    const { primarySearchTag = [] } = storage;
    var sequence = sequenceNumber;
    primarySearchTag.map((element) => {
      tagBadge.insertAdjacentHTML(
        "beforeend",
        `<button id="primaryBadge${sequence++}" disabled type="button" class="d-flex align-items-center btn btn-warning badge">
          <div>${element.name}</div>
          </button>`
      );
    });
    sequenceNumber = sequence;
    setDataInMemory({ key: "savedSequenceNumber", value: sequence });
    if (primarySearchTag.length) {
      onSearchUpdate();
    }
  }

  getDataFromMemory({
    key: "primarySearchTag",
    callback: getPrimaryTagFromMemory,
  });

  function addTagtoPrimarySearch() {
    if (searchBar.value) {
      tagBadge.insertAdjacentHTML(
        "beforeend",
        `<button disabled type="button" class="d-flex align-items-center btn btn-warning badge">
                <div>${searchBar.value}</div>
                </button>`
      );
      setDataInMemory({
        key: "savedSequenceNumber",
        value: sequenceNumber + 1,
      });
      searchBar.value = "";
      sequenceNumber += 1;
      onSearchUpdate();
    }
  }

  getEventAttached({
    elementIdentifier: "addTag",
    selectorType: "id",
    eventName: "click",
    observer: addTagtoPrimarySearch,
  });

  function clearAllSubscriber() {
    function clearMemData() {
      tagBadge.innerHTML = null;
      onSearchUpdate();
    }

    setDataInMemory({
      key: "primarySearchTag",
      value: [],
      callback: clearMemData,
    });
  }

  getEventAttached({
    elementIdentifier: "clear-all",
    selectorType: "id",
    eventName: "click",
    observer: clearAllSubscriber,
  });

  getEventAttached({
    elementIdentifier: "search",
    selectorType: "id",
    eventName: "keyup",
    observer: onSearchUpdate,
  });
};
