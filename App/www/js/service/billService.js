ionicApp.factory('billService', ['Restangular', function (Restangular) {
    var res = Restangular.all('bills');
    return {
        get: function (id) {
            return res.one(id).get();
        },
        searchBillProduct: function (params, billTypeId, billStyleId, billStatusCode, acceptorTypeId, locationId, tradeTypeCode, billCharacterCode, billFlawId) {
            var queryParam = {
                'p': params.page(),
                'n': params.count(),
                'orderBy': params.orderBy(),
                //'isAlive': isAlive,
                'billTypeId': billTypeId,
                'billStyleId': billStyleId,
                'billStatusCode': billStatusCode,
                'acceptorTypeId': acceptorTypeId,
                'locationId': locationId,
                'tradeTypeCode': tradeTypeCode,
                'billCharacterCode': billCharacterCode,
                'billFlawId': billFlawId
            }

            return res.get('billProduct', queryParam).then(function (result) {
                params.total(result.page_info.items_number);
                return result.bill_products;
            });
        },
        searchBillProduct2: function (params, billTypeId, billStyleId, billStatusCode, acceptorTypeId, locationId, tradeTypeCode, billCharacterCode, billFlawId) {
            var queryParam = {
                'p': params.page(),
                'n': params.count(),
                'orderBy': params.orderBy(),
                //'isAlive': isAlive,
                'billTypeId': billTypeId,
                'billStyleId': billStyleId,
                'billStatusCode': billStatusCode,
                'acceptorTypeId': acceptorTypeId,
                'locationId': locationId,
                'tradeTypeCode': tradeTypeCode,
                'billCharacterCode': billCharacterCode,
                'billFlawId': billFlawId
            }

            return res.one('billProduct', 'getAllByAddress').get(queryParam).then(function (result) {
                params.total(result.page_info.items_number);
                return result.bill_products;
            });
        },
        searchBillOffer: function (params, search, publishingTimeS, publishingTimeB, billStyleId, enterpriseName, tradeLocationId) {
            var queryParam = {
                'func': 'search',
                'billStyleId': billStyleId,
                'enterpriseName': enterpriseName,
                'publishingTimeS': publishingTimeS,
                'publishingTimeB': publishingTimeB,
                'tradeLocationId': tradeLocationId,
                'billTypeId': 0,
                'p': params.page(),
                'n': params.count(),
                'orderBy': params.orderBy(),
            }

            return res.get('billOffer', queryParam).then(function (result) {
                params.total(result.page_info.items_number);
                return result.bill_offers;
            });
        },
        searchBillOffer0: function (params, search, publishingTimeS, publishingTimeB, billStyleId, enterpriseName, tradeLocationId) {
            var queryParam = {
                'func': 'search',
                'billStyleId': billStyleId,
                'enterpriseName': enterpriseName,
                'publishingTimeS': publishingTimeS,
                'publishingTimeB': publishingTimeB,
                'tradeLocationId': tradeLocationId,
                'billTypeId': 0,
                'p': params.page(),
                'n': params.count(),
                'orderBy': params.orderBy(),
            }

            return res.get('billOffer', queryParam).then(function (result) {
                params.total(result.page_info.items_number);
                return result;
            });
        },
        searchBillOffer2: function (params, search, publishingTimeS, publishingTimeB, billStyleId, enterpriseName, tradeLocationId) {
            var queryParam = {
                'func': 'search',
                'billStyleId': billStyleId,
                'enterpriseName': enterpriseName,
                'publishingTimeS': publishingTimeS,
                'publishingTimeB': publishingTimeB,
                'tradeLocationId': tradeLocationId,
                'billTypeId': 0,
                'p': params.page(),
                'n': params.count(),
                'orderBy': params.orderBy(),
                'needExpand': 1
            }

            return res.get('billOffer', queryParam).then(function (result) {
                params.total(result.page_info.items_number);
                return result.bill_offers;
            });
        },

        //首页获取最新报价
        getHomeBillOffer: function (func,billStyleId,n) {
            var queryParam = {
                'func': func,
                'billStyleId': billStyleId,
                'n':n,
            }
            return res.get('billOffer', queryParam).then(function (result) {
                return result.bill_offers;
            })
        },
        //首页获取最新票据
        getHomeBillProduct: function (func,billTypeId) {
            var queryParam = {
                'func': func,
                'billTypeId': billTypeId,
            }
            return res.get('billProduct', queryParam).then(function (result) {
                return result.bill_products;
            })
        },
        // 机构报价获取最新个人的报价
        getBillOfferBySelf: function(){
            return res.all('billOffer').one('getBillOfferBySelfToday' + '?single=' + 1).get();
        },
        getOwnBillOffer: function (params, billStyleId, enterpriseName, tradeLocationId) {
            var queryParam = {
                'billStyleId': billStyleId,
                'enterpriseName': enterpriseName,
                'tradeLocationId': tradeLocationId,
                'p': params.page(),
                'n': params.count(),
                'orderBy': params.orderBy(),
            }

            return res.get('billOffer', queryParam).then(function (result) {
                params.total(result.page_info.items_number);
                return result.bill_offers;
            });
        },
        getOwnBillOffer: function (params, billTypeId, billStyleId, maxPrice, tradeLocationId, keyword) {
            var queryParam = {
                'p': params.page(),
                'n': params.count(),
                'keyword': keyword,
                'orderBy': params.orderBy(),
                'billTypeId': billTypeId,
                'billStyleId': billStyleId,
                'tradeLocationId': tradeLocationId,
                'maxPrice': maxPrice
            }

            return res.get('billOffer', queryParam).then(function (result) {
                params.total(result.page_info.items_number);
                return result.bill_offers;
            });
        },
        getBillOffer: function (billOfferId) {
            return res.all('billOffer').one(billOfferId.toString()).get();
        },
        getBills: function (billSId) {
            console.log(billSId)
            //return res.all('')
        },
        insertBillProduct: function (model) {
            return res.all('bill').post(model);
        },
        getOwnBillProduct: function (params, billTypeId, isAlive, billStatusCode) {
            var queryParam = {
                'p': params.page(),
                'n': params.count(),
                'orderBy': params.orderBy(),
                'isAlive': isAlive,
                'billTypeId': billTypeId,
                'billStatusCode': billStatusCode,
            }

            return res.get('bill', queryParam).then(function (result) {
                params.total(result.page_info.items_number);
                return result.bill_products;
            });
        },
        getBillDetail: function (BillId) {
            return res.all('bill').one(BillId.toString()).get();
        },
        newOrderBidding: function (model) {
            return res.all('order').post(model);
        },
        getOwnBillBidding: function (params, billTypeId, status) {
            var queryParam = {
                'p': params.page(),
                'n': params.count(),
                'billTypeId': billTypeId,
                'status': status,
            }

            return res.get('bidding', queryParam).then(function (result) {
                params.total(result.page_info.items_number);
                return result.bill_product_biddings;
            });
        },
        getOwnBidding: function () {
            return res.get('bidding', {}).then(function (result) {
                return result.bill_product_biddings;
            });
        },

        getOrderWait: function (params) {
            var queryParam = {
                'p': params.page(),
                'n': params.count(),
                'orderBy': params.orderBy(),
            }

            return res.get('orderWait', queryParam).then(function (result) {
                return result.bill_confirms;
            });
        },
        confirmOrderWait: function (orderConfirmId, model) {
            return res.all('orderWait').one(orderConfirmId.toString()).customPUT(model);
        },
        getBillProduct: function (billProductId) {
            return res.all('bill').one(billProductId.toString()).get();
        },
        getBillProductBidding: function (billProductId) {
            return res.all('bidding').one(billProductId.toString()).get();
        },
        insertBillBidding: function (model) {
            return res.all('bidding').post(model);
        },
        deleteBillBidding: function (id) {
            return res.all('bidding').one(id.toString()).customDELETE();
        },
        updateOwnBillOffer: function (model) {
            return res.one('billOffer', model.id).customPUT(model);
        },
        queryOfferData: function () {
            return res.get('billOffer', {}).then(function (result) {
                return result.bill_offer_rates;
            });
        },
        insertBillOffer: function (model) {
            return res.all('billOffer').post(model);
        },

        updateBillOffer: function (model) {
            return res.one('billOffer', model.id).customPUT(model);
        },
        deleteBillOffer: function (billOfferId) {
            return res.all('billOffer').customDELETE(billOfferId);
        },
        billProductElectronic: function () {
            var queryParam = {
                'billTypeId': 101,
                'func': 'home'
            }

            return res.get('billProduct', queryParam);
        },
        billProductPaper: function () {
            var queryParam = {
                'billTypeId': 102,
                'func': 'home'
            }

            return res.get('billProduct', queryParam);
        },
        billOfferPaper: function () {
            var queryParam = {
                'func': 'home'
            }

            return res.get('billOffer', queryParam);
        },

        updateBillProduct: function (billProductId, model) {
            return res.all('bill').one(billProductId.toString()).customPUT(model);
        },
        deleteBill: function (billId) {
            return res.all('bill').customDELETE(billId);
        },
        //deleteBill: function (billProductId) {
        //    return res.all('bill').customDELETE(billProductId);
        //},

        getBillsNumber: function (billTypeId) {
            return res.get('number', { 'billTypeId': billTypeId });
        },

        generateOrders: function (model) {
            console.log("预约出票生成订单")
            console.log(model)
            return res.all('order').one('ahead').customPOST(model)
        },
        finishBillNew: function (billProductId) {
            return res.all('billFinish').one(billProductId.toString()).get();
        },
        updateBillHpx: function (billProductId, model) {
            console.log(billProductId)
            console.log(model)
            return res.all('bill').one(billProductId.toString() + '?doComplete=' + 1).customPUT(model);
        },
        getBillOfferBySelfToday: function (params) {
            var queryParam = {
                'p': params.page(),
                'n': params.count(),
            }
            return res.one("billOffer", "getBillOfferBySelfToday").get(queryParam).then(function (result) {
                params.total(result.page_info.items_number);
                return result.billOffers;
            });
        },
        // 查询乙方信息
        insertEnterpriseId: function (billId, enterpriseId) {
            return res.all('bill').one('insertEnterpriseId' + '?billId=' + billId + '&enterpriseId=' + enterpriseId).get();
        }
    }
}]);
