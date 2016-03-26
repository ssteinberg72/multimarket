var RFP = {
	rfpNo : "",
	requester: {
		aeName:"",
		aeCode:"",
		aeRegion:""
	},
	role:"",
	agency : "",
	agyShortName:"",
	advertiser: "",
	advShortName: "",
	businessCategory: "",
	secondCategory:"",
	dateReceived: "",
	dueDate:"",
	brand:"",
	campaign:"",
	campBudget: 0,
	notes:"",
	openedToMarket:"",
	createDate:"",
	openToMarketDate:""
}

var RequestItem = function() {
    this.riNo= "";
    this.rfpNo = "";
    this.mediaType = "";
    this.status = "new";
    this.budget = 0;
    this.delegateTo = "";
    this.isTargeted = "";
    this.isFlexible = "";
    this.isDeleted = "";
    this.startDate = "";
    this.endDate = "";
    this.responderId =  "";
}

//create an empty beard object for binding only
$("#beard_all").oms_beard({htmlstr:""});
var BEARD = $("#beard_all").data("oms_beard");

var DATA = {
		rfp : {},
		requestItems:{},
		carts:{},
		category:{},
		markets:{},
		delegatePersons:{}
}

var ACTIONS = {
	createRFP : function(){
		BEARD.getDivData(DATA.rfp, "#rfpInfoPanel");
		try{
			DATA.rfp.campBudget = parseInt(DATA.rfp.campBudget);
		}catch(e){
			DATA.rfp.campBudget = 0;
		}
		OMS.Services.factory("createRFP", DATA.rfp,
				function(data){
				  location.href = location.href + '&rfpNo=' + data.rfpNo;
		});
	},
	updateRFP : function(){
		BEARD.getDivData(DATA.rfp, "#rfpInfoPanel");
		try{
			DATA.rfp.campBudget = parseInt(DATA.rfp.campBudget);
		}catch(e){
			DATA.rfp.campBudget = 0;
		}
		OMS.Services.factory("updateRFP", DATA.rfp,
			function(data){
			  console.log("update...");
			  location.reload();
		});

	},
	addRequestItem : function(){
		var ri = new RequestItem();
		ri.userHandle = DATA.rfp.userHandle;
		ri.rfpNo = DATA.rfp.rfpNo;

		BEARD.getDivData(ri, "#item_add_panel");
		try{
			ri.budget = parseInt(ri.budget);
		}catch(e){
			ri.budget = 0;
		}
		OMS.Services.factory("createRequestItem", ri,
			function(data){
			  console.log("created new rquest item...");
			  location.reload();
		});
	},
	updateRequestItem : function(ele){
		var ele_id = $(ele).closest(".panel-primary")[0].id;
		var riNo = ele_id.substring(3);
		var ri = $.grep(DATA.rfp.requestItems, function(e){ return e.riNo == riNo; })[0];
		BEARD.getDivData(ri, "#"+ele_id);
		ri.userHandle = DATA.rfp.userHandle;
		try{
			ri.budget = parseInt(ri.budget);
		}catch(e){
			ri.budget = 0;
		}

		//console.log(ri);
		OMS.Services.factory("updateRequestItem", ri,
				function(data){
				  console.log("update rquest item...");
				  location.reload();
	    });
	},
	deleteRequestItem : function(itemId){
		//console.log(ri);
		OMS.Services.factory("deleteRequestItem", {
			userHandle: DATA.rfp.userHandle,
			rfpNo : DATA.rfp.rfpNo,
			riNo : itemId
		},
		function(data){
				  console.log("delete rquest item...");
				  location.reload();
	    });
	},
	getTemplate : function(tempName, callback){
		if(callback == null){
			callback = function(){return TEMPLATES[tempName];}
		}
		if( TEMPLATES[tempName] == null){
			$.when(
				$.get(OMS.Util.getOMSBaseUrl() + "templates/"+ tempName +".html?v=1", function(template) {
				    TEMPLATES[tempName] = template;
				})
			).done(callback);
		} else{
			callback();
		}
	},
	addRICarts : function(){
		if(DATA.carts.length > 0){
			ACTIONS.getTemplate("cartTable", function(){
				$(".ri-cart").each(function(){
		              var cart_id = this.id.substring(5); //remove "cart_"
		              var cart_data = $.grep(DATA.cart, function(e){ return e.referenceNumber == cart_id; });
		              if(cart_data.length > 0){
		                BEARD.bindingOnly(this, {htmlstr: TEMPLATES["cartTable"],
		            	                       data: cart_data[0]});
		              }
				});
				$("button > .glyphicon-minus, .glyphicon-plus").parent().click(function(){
			    	$(this).children(".glyphicon-minus, .glyphicon-plus").toggleClass("glyphicon-minus glyphicon-plus");
			    })
			})
		}
	},
	addChatHistory : function(){
		for(var i=0;i< DATA.requestItems.length; i++){
			var messages = $.grep(DATA.chatHistory, function(e){ return e.requestItemId == DATA.requestItems[i].id; });
	        if(messages.length > 0){
	        	var $chatDivId = "#chat_" + DATA.requestItems[i].id;
	        	BEARD.bindingOnly($chatDivId, {htmlstr: TEMPLATES["chatHistory"],
	                data: messages});
	        }
		}
		$(".comments_link").click(function(){
	  	  $(this).parent().next().toggle();
	    })
	},

	/* Get all necessary data */
	initData : function(callback){
		var pair = OMS.Util.queryStringPair();
		DATA.rfp = RFP;
        DATA.rfp.userHandle = pair["user"] == null ? '' : pair["user"];
        DATA.rfp.role = pair["role"] == null ? 'requester' : pair["role"];
        DATA.rfp.rfpNo = pair["rfpno"];
        DATA.delegatePersons = [{pid:"123", name:"Mark TT"},
    	                        {pid:"145", name:"Peter Pan"}];
        if(DATA.rfp.rfpNo == null){
        	$.when(
 	     		   OMS.Services.factory("region", {userHandle:DATA.rfp.userHandle}),
 	     		   OMS.Services.factory("business_category", {userHandle:DATA.rfp.userHandle})
 	             ).done( function(data0,data1,data2){
 	             	 DATA.markets = data0[0].results;
 	             	 DATA.category = data1[0].results;
 	             	 callback();
 	         });
        }else{
	         $.when(
	     		   OMS.Services.factory("region", {userHandle:DATA.rfp.userHandle}),
	     		   OMS.Services.factory("business_category", {userHandle:DATA.rfp.userHandle}),
	     		   OMS.Services.factory("getRFPInfo", {userHandle:DATA.rfp.userHandle, rfpNo:DATA.rfp.rfpNo})
	             ).done( function(data0,data1,data2){
	             	 DATA.markets = data0[0].results;
	             	 DATA.category = data1[0].results;
	             	 DATA.rfp = $.extend(DATA.rfp, data2[0]);
	             	 callback();
	         });
        }
	},
	createRFPInfo : function(){
	     this.getTemplate("rfpInfo", function(){
			$("#rfpInfoPanel").oms_beard({
	            data: DATA.rfp,
	            htmlstr: TEMPLATES["rfpInfo"],
	            bindingComplete: function(){
	            	ACTIONS.createTA();
	            	$("#dateReceived").datepicker();
	            }
	        });
         })
	},

	createRequestItems : function(){
		this.getTemplate("requestItem", function(){
			$("#requestItemList").oms_beard({
	         data: DATA.rfp,
	         htmlstr: TEMPLATES["requestItem"],
	         bindingComplete: function(){
				    $(".item_add_btn").on("click",function(){
				          $("#item_add_panel").show();
				    });
				    $(".item_comments_btn").click(function(){
				        $(this).siblings(".item_comments_panel").toggle();
				    });
				    ACTIONS.addRICarts();
				    ACTIONS.addChatHistory();
			    }
	     });
		});
	},
	createSidebar : function(){
		this.getTemplate("sidebar", function(){
		$("#sidebar-float").oms_beard({
         data: DATA.rfp,
         htmlstr: TEMPLATES["sidebar"],
		    bindingComplete: function(){
	             $("#hideSidebar").on("click",function(){
			        $("#sidebar-float").hide();
			        $("#sidebar-min").show();
			    });
			    $("#hideSidebar").on("click",function(){
			        $("#sidebar-float").hide();
			        $("#sidebar-min").show();
			    });
			    $("#sidebar-min").on("click",function(){
			        $("#sidebar-min").hide();
			        $("#sidebar-float").show();
			    });
		    }
	     })
		});
	},
	// create type ahead fields
	createTA : function() {
		// this functions are in cms.contract.tab.header.js
	    createSPTA("#aeName", DATA.rfp.requester.aeCode, "#aeCode");
	    createAdvertiserTA("#advertiser");
	    createAgencyTA("#agency");
	    createBrandTA("#brand");
	}
}
var TEMPLATES = {"sidebar" : ['<ul class="nav">',
                              '<li style="background-color:white"><span id="hideSidebar" class="glyphicon glyphicon-th-list ','pull-right btn" style="color:#eb9316;z-index:1001"></span></li>',
                            '{{if this.role == "requester" || this.role == null}}',
                              '<li class="active">',
                                           '<a data-toggle="tab" href="#requestItemTab">Request Items </a>',
                                    '</li>',
                                    '<li><a data-toggle="tab" href="#customResearchTab">Custom Research </a></li>',
                                    '<li><a data-toggle="tab" href="#generateProposalTab">Generate Proposal </a></li>',
                            '{{elsif this.role == "responder"}}',
                              '<li class="active">',
                                           '<a href="#requestItemTab">Request Items </a>',
                                    '</li>',
                            '{{elsif this.role == "research"}}',
                                '<a data-toggle="tab" href="#requestItemTab">Requests</a>',
                                         '<div>',
                                            '<ul id="itemSubMenu" class="sidebar-submenu">',
                            '                  ',
                                            '</ul>',
                                         '</div> ',
                            '{{endif}}',
                            '</ul>'].join(''),
                   "chatHistory":[
                               '<div class="panel panel-default" style="padding-left:10px">',
                               '<div class="panel-body">',
                               '{{for}}',
                               '<div class="row comments_row">',
                                 '<button class="btn btn-info user_btn btn-xs">',
                                   '<span class="glyphicon glyphicon-user"></span>',
                                 '</button><b>{{sentBy}}:</b>',
                                 '<a href="javascript:void(0)" class="comments_link">{{message}}</a>',
                               '</div>',
                               '<div class="row comments_row comments_details">',
                                 '<span>{{message}}</span>',
                               '</div>',
                               '{{endfor}}',
                               '<div class="row comments_row">',
                                 '<button class="btn btn-info user_btn btn-xs">',
                                   '<span class="glyphicon glyphicon-user"></span>',
                                 '</button><b>ME:</b>',
                               '</div>',
                               '<div class="row">',
                                 '<textarea rows="5" cols="60"></textarea>',
                                 '<button class="btn btn-success btn-xs">Send</button>',
                               '</div>',
                               '</div>',
                          '</div>'].join("")
                 }

var rfpMockData = {
		"id" : "12345",
		"salesAE":{"aeCode":"X29","aeRegion":"010","aeName":"Barrett, Jane (CBS Radio)"},
		"role": "requester",
        "agency" : "cbs agent",
		"advertiser" : "cbs tv",
		"advertiserShortName" : "cbs",
		"businessCategory" : "cate one",
		"secondCategory" :"cate two",
		"dateRFPReceived": "02/08/2016",
		"dueDate" :"03/30/2016",
		"brand" :"brand one",
		"campaign" : "camp",
		"campaignBudget" : "30000",
		"notes" :"some notes",
		"openedToMarket" :"false",
		"createdDate" :"02/10/2016",
		"openToMarketDate" :""
		}
var marketMockData = [{"code":"060","name":"ATLANTA","active":true,"isPrimary":false},{"code":"754","name":"BALTIMORE,MD","active":true,"isPrimary":false},{"code":"170","name":"BOSTON","active":true,"isPrimary":false},{"code":"768","name":"BRANSON/SPRINGFIELD, MO","active":true,"isPrimary":false},{"code":"196","name":"CANTON, OH","active":true,"isPrimary":false},{"code":"710","name":"CHATTANOOGA","active":true,"isPrimary":false},{"code":"020","name":"CHICAGO","active":true,"isPrimary":false},{"code":"717","name":"CINCINNATI","active":true,"isPrimary":false},{"code":"195","name":"CLEVELAND","active":true,"isPrimary":false},{"code":"108","name":"COLORADO SPRINGS, CO","active":true,"isPrimary":false},{"code":"747","name":"COLUMBIA, SC","active":true,"isPrimary":false},{"code":"711","name":"COLUMBUS, GA","active":true,"isPrimary":false},{"code":"727","name":"COLUMBUS, OH","active":true,"isPrimary":false},{"code":"070","name":"DALLAS","active":true,"isPrimary":false},{"code":"197","name":"DAYTON, OH","active":true,"isPrimary":false},{"code":"723","name":"DENVER","active":true,"isPrimary":false},{"code":"712","name":"DETROIT","active":true,"isPrimary":false},{"code":"735","name":"FLINT","active":true,"isPrimary":false},{"code":"713","name":"FRESNO, CA","active":true,"isPrimary":false},{"code":"736","name":"FT. LAUDERDALE","active":true,"isPrimary":false},{"code":"742","name":"FT. WAYNE","active":true,"isPrimary":false},{"code":"714","name":"GRAND RAPIDS","active":true,"isPrimary":false},{"code":"752","name":"GREAT PLAINS NM","active":true,"isPrimary":false},{"code":"740","name":"HARTFORD/NEW HAVEN","active":true,"isPrimary":false},{"code":"729","name":"HOUSTON","active":true,"isPrimary":false},{"code":"751","name":"INDIANA NM","active":true,"isPrimary":false},{"code":"737","name":"INDIANAPOLIS","active":true,"isPrimary":false},{"code":"738","name":"JACKSONVILLE","active":true,"isPrimary":false},{"code":"739","name":"KANSAS CITY","active":true,"isPrimary":false},{"code":"730","name":"LAS VEGAS","active":true,"isPrimary":false},{"code":"030","name":"LOS ANGELES","active":true,"isPrimary":false},{"code":"716","name":"LOUISVILLE","active":true,"isPrimary":false},{"code":"993","name":"MALL MULTI-MARKET (B&W USE)","active":true,"isPrimary":false},{"code":"755","name":"MALLS","active":true,"isPrimary":false},{"code":"718","name":"MEMPHIS","active":true,"isPrimary":false},{"code":"241","name":"MIAMI","active":true,"isPrimary":false},{"code":"021","name":"MIDWEST NM","active":true,"isPrimary":false},{"code":"080","name":"MINNEAPOLIS","active":true,"isPrimary":false},{"code":"719","name":"NASHVILLE","active":true,"isPrimary":false},{"code":"753","name":"NEW HAMPSHIRE","active":true,"isPrimary":false},{"code":"090","name":"NEW JERSEY","active":true,"isPrimary":false},{"code":"110","name":"NEW ORLEANS","active":true,"isPrimary":false},{"code":"010","name":"NEW YORK","active":true,"isPrimary":true},{"code":"171","name":"NEW YORK NM","active":true,"isPrimary":false},{"code":"745","name":"NORTH CAROLINA","active":true,"isPrimary":false},{"code":"756","name":"NORTHWEST NM","active":true,"isPrimary":false},{"code":"198","name":"OHIO NM","active":true,"isPrimary":false},{"code":"741","name":"ORLANDO","active":true,"isPrimary":false},{"code":"770","name":"OUTERNET","active":true,"isPrimary":false},{"code":"765","name":"PENNSYLVANIA NM","active":true,"isPrimary":false},{"code":"100","name":"PHILADELPHIA","active":true,"isPrimary":false},{"code":"180","name":"PHOENIX","active":true,"isPrimary":false},{"code":"766","name":"PUERTO RICO","active":true,"isPrimary":false},{"code":"748","name":"RENO","active":true,"isPrimary":false},{"code":"724","name":"ROCKY MOUNTAIN","active":true,"isPrimary":false},{"code":"725","name":"SACRAMENTO","active":true,"isPrimary":false},{"code":"720","name":"SALT LAKE","active":true,"isPrimary":false},{"code":"075","name":"SAN ANTONIO","active":true,"isPrimary":false},{"code":"721","name":"SAN DIEGO","active":true,"isPrimary":false},{"code":"040","name":"SAN FRANCISCO","active":true,"isPrimary":false},{"code":"746","name":"SOUTH CAROLINA","active":true,"isPrimary":false},{"code":"077","name":"SOUTHWEST NM","active":true,"isPrimary":false},{"code":"722","name":"SPORTS MARKETING","active":true,"isPrimary":false},{"code":"731","name":"ST. LOUIS","active":true,"isPrimary":false},{"code":"130","name":"TAMPA","active":true,"isPrimary":false},{"code":"071","name":"TYLER, TX","active":true,"isPrimary":false},{"code":"799","name":"VAN WAGNER CONVERSION","active":true,"isPrimary":false},{"code":"733","name":"VIRGINIA","active":true,"isPrimary":false},{"code":"050","name":"WASHINGTON, DC","active":true,"isPrimary":false},{"code":"769","name":"WEST PALM BEACH","active":true,"isPrimary":false},{"code":"022","name":"WISCONSIN NM","active":true,"isPrimary":false}];

var requestItemMockData = [{
	id:"12345",
	rfp:"34343",
	budget: "100000",
	delegateTo: "123",
	endDate: "3/20/2016",
	isFlexible: true,
	isTargeted: "Y",
	market: "170",
	mediaType: "PS",
	status:"new",
	notes: "some notes",
	startDate: "2/15/1016",
	targetedAudience: "target audience ...",
	carts:[{refno:"0000081"},
		   {refno:"0000082"}]
},{
	id:"12346",
	rfp:"34343",
	budget: "200000",
	delegateTo: "123",
	endDate: "3/20/2016",
	isFlexible: true,
	isTargeted: "N",
	market: "020",
	mediaType: "PS",
	status:"new",
	notes: "some notes",
	startDate: "2/17/1016",
	targetedAudience: "target audience ...",
	carts:[{refno:"0000081"},
		   {refno:"0000082"}]
}];
var omsCarts =
	[
	{
	  "referenceNumber":"0000081",
	  "isInheritedAuthorization":false,
	  "inheritedFrom":"",
	  "authorizationLevel":"P",
	  "status":"X",
	  "shared":true,
	  "updateCount":0,
	  "primaryAE":{
	    "code":"400",
	    "name":"Atlanta House"
	  },
	  "description":"My Cart 1",
	  "rfpNumber":"",
	  "availability":
	      {
	        "startDateCYMD":"",
	        "startDateUSA":"",
	        "startDate":"",
	        "endDateCYMD":"",
	        "endDateUSA":"",
	        "endDate":"",
	        "period":"",
	        "periodSelect":"",
	        "term":"",
	        "termSelect":""
	      },
	  "items":[
	  {
	    "dateRanges":[
	      {
	        "startDateCYMD":"1160104",
	        "startDateUSA":"01/04/2016",
	        "startDate":"01/04/16",
	        "endDateCYMD":"1160131",
	        "endDateUSA":"01/31/2016",
	        "endDate":"01/31/16",
	        "period":"4-Week",
	        "periodSelect":"4",
	        "term":"04",
	        "termSelect":"1"
	      }
	    ],
	    "itemRowIndex":0,
	    "status":"A",
	    "marketCode":"OT",
	    "marketName":"New York",
	    "number":"0TS7112",
	    "suffix":"O",
	    "description":"1557 Broadway",
	    "face":"E",
	    "mediaCode":"BL",
	    "media":"Bulletins",
	    "sizeCode":"48433",
	    "size":"10'x62'7",
	    "tabPanelID":515031,
	    "eighteenPlusEOI":879573,
	    "illuminated":18,
	    "parRateGross":45000.00,
	    "parRateNet":38250.00,
	    "rateCardGross":58823.53,
	    "rateCardNet":50000.00,
	    "proposedRateGross":58823.53,
	    "proposedRateNet":50000.00,
	    "showingType":"R",
	    "latitude":"40.759125",
	    "longitude":"-73.985345",
	    "lastComment":""
	  }
	  ,{
	    "dateRanges":[
	      {
	        "startDateCYMD":"1160104",
	        "startDateUSA":"01/04/2016",
	        "startDate":"01/04/16",
	        "endDateCYMD":"1160131",
	        "endDateUSA":"01/31/2016",
	        "endDate":"01/31/16",
	        "period":"4-Week",
	        "periodSelect":"4",
	        "term":"04",
	        "termSelect":"1"
	      }
	    ],
	    "itemRowIndex":1,
	    "status":"A",
	    "marketCode":"KC",
	    "marketName":"Kansas City",
	    "number":"029992A",
	    "suffix":"1",
	    "description":"I-70 W/O Buckner Exit N/S",
	    "face":"E",
	    "mediaCode":"BL",
	    "media":"Bulletins",
	    "sizeCode":"47769",
	    "size":"14'x48'",
	    "tabPanelID":543127,
	    "eighteenPlusEOI":204802,
	    "illuminated":18,
	    "parRateGross":2000.00,
	    "parRateNet":1700.00,
	    "rateCardGross":4705.88,
	    "rateCardNet":4000.00,
	    "proposedRateGross":4705.88,
	    "proposedRateNet":4000.00,
	    "showingType":"R",
	    "latitude":"39.022855",
	    "longitude":"-94.205993",
	    "lastComment":""
	  }
	  ]
	},
	{
	  "referenceNumber":"0000082",
	  "isInheritedAuthorization":false,
	  "inheritedFrom":"",
	  "authorizationLevel":"P",
	  "status":"X",
	  "shared":true,
	  "updateCount":0,
	  "primaryAE":{
	    "code":"400",
	    "name":"Atlanta House"
	  },
	  "description":"My Cart 2",
	  "rfpNumber":"",
	  "availability":
	      {
	        "startDateCYMD":"",
	        "startDateUSA":"",
	        "startDate":"",
	        "endDateCYMD":"",
	        "endDateUSA":"",
	        "endDate":"",
	        "period":"",
	        "periodSelect":"",
	        "term":"",
	        "termSelect":""
	      },
	  "items":[
	  {
	    "dateRanges":[
	      {
	        "startDateCYMD":"1160104",
	        "startDateUSA":"01/04/2016",
	        "startDate":"01/04/16",
	        "endDateCYMD":"1160131",
	        "endDateUSA":"01/31/2016",
	        "endDate":"01/31/16",
	        "period":"4-Week",
	        "periodSelect":"4",
	        "term":"04",
	        "termSelect":"1"
	      }
	    ],
	    "itemRowIndex":0,
	    "status":"A",
	    "marketCode":"OT",
	    "marketName":"New York",
	    "number":"0TS7112",
	    "suffix":"O",
	    "description":"1557 Broadway",
	    "face":"E",
	    "mediaCode":"BL",
	    "media":"Bulletins",
	    "sizeCode":"48433",
	    "size":"10'x62'7",
	    "tabPanelID":515031,
	    "eighteenPlusEOI":879573,
	    "illuminated":18,
	    "parRateGross":45000.00,
	    "parRateNet":38250.00,
	    "rateCardGross":58823.53,
	    "rateCardNet":50000.00,
	    "proposedRateGross":58823.53,
	    "proposedRateNet":50000.00,
	    "showingType":"R",
	    "latitude":"40.759125",
	    "longitude":"-73.985345",
	    "lastComment":""
	  }
	  ,{
	    "dateRanges":[
	      {
	        "startDateCYMD":"1160104",
	        "startDateUSA":"01/04/2016",
	        "startDate":"01/04/16",
	        "endDateCYMD":"1160131",
	        "endDateUSA":"01/31/2016",
	        "endDate":"01/31/16",
	        "period":"4-Week",
	        "periodSelect":"4",
	        "term":"04",
	        "termSelect":"1"
	      }
	    ],
	    "itemRowIndex":1,
	    "status":"A",
	    "marketCode":"KC",
	    "marketName":"Kansas City",
	    "number":"029992A",
	    "suffix":"1",
	    "description":"I-70 W/O Buckner Exit N/S",
	    "face":"E",
	    "mediaCode":"BL",
	    "media":"Bulletins",
	    "sizeCode":"47769",
	    "size":"14'x48'",
	    "tabPanelID":543127,
	    "eighteenPlusEOI":204802,
	    "illuminated":18,
	    "parRateGross":2000.00,
	    "parRateNet":1700.00,
	    "rateCardGross":4705.88,
	    "rateCardNet":4000.00,
	    "proposedRateGross":4705.88,
	    "proposedRateNet":4000.00,
	    "showingType":"R",
	    "latitude":"39.022855",
	    "longitude":"-94.205993",
	    "lastComment":""
	  }
	  ]
	}
	];

var chatHistoryMockData = [{
	requestItemId:"12345",
	sentBy:"Steven Steinberg",
	message:"A message from requester",
	sentDate:"2/20/2016",
	sentTime:"10:00 AM"
},{
	requestItemId:"12345",
	sentBy:"Stephen Curry",
	message:"A message from responder",
	sentDate:"2/20/2016",
	sentTime:"10:30 AM"
},{
	requestItemId:"12345",
	sentBy:"Steven Steinberg",
	message:"Another message from requester",
	sentDate:"2/20/2016",
	sentTime:"11:00 AM"
},{
	requestItemId:"12346",
	sentBy:"Steven Steinberg",
	message:"A message from requester",
	sentDate:"2/20/2016",
	sentTime:"10:00 AM"
},{
	requestItemId:"12346",
	sentBy:"Stephen Curry",
	message:"A message from responder",
	sentDate:"2/20/2016",
	sentTime:"10:00 AM"
}]
