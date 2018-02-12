var map, markerA, markerB, marker
var markerLayer_s = new Tmap.Layer.Markers("start");// 마커 레이어 생성
var markerLayer_e = new Tmap.Layer.Markers("end");
var markerLayer = new Tmap.Layer.Markers();
var routeLayer = new Tmap.Layer.Vector("route");
routeLayer.style ={
    fillColor:"#FF0000",
    fillOpacity:0.2,
    strokeColor: "#FF0000",
    strokeWidth: 3,
    strokeDashstyle: "solid",
    pointRadius: 2,
    title: "this is a red line"	
};
var lonlat = new Tmap.LonLat(126.984895, 37.566369).transform("EPSG:4326", "EPSG:3857");//좌표 설정
var geolocation = navigator.geolocation;

var icon_s = icon("s");
var icon_e = icon("e");

var start_x;
var start_y;
var end_x;
var end_y;

var input_s = false;
var input_e = false;

// 홈페이지 로딩과 동시에 맵을 호출할 함수
function initTmap(){
    map = new Tmap.Map({
        div:'map_div',
        width : "40rem",
        height : "40rem",
    });

    map.events.register("click", map, onClick);
    
    map.addLayer(markerLayer_s); // 맵에 마커레이어 추가
    map.addLayer(markerLayer_e);
    map.addLayer(markerLayer);

    // HTML5의 geolocation으로 사용할 수 있는지 확인합니다. 
    // 현재 위치 정보를 얻어오는 메서드이다. 사용자가 허용을 할 경우 실행된다.
        // GeoLocation을 이용해서 접속 위치를 얻어옵니다.
        if (geolocation)    geoLocation();
}
// 나의 위치정보를 나타낼 메서드
function geoLocation() {
    navigator.geolocation.getCurrentPosition(function(position){
        // 마커가 표시될 위치를 geolocation으로 얻어온 좌표로 생성합니다
        lat = position.coords.latitude; // 위도
        lon = position.coords.longitude; // 경도

        moveCoordinate("s", lon, lat);
    });
}

function moveCoordinate (value, x, y) {
    var PR_3857 = new Tmap.Projection("EPSG:3857");  // Google Mercator 좌표계인 EPSG:3857
    var PR_4326 = new Tmap.Projection("EPSG:4326");  // WGS84 GEO 좌표계인 EPSG:4326

    lonlat = new Tmap.LonLat(x, y).transform(PR_4326, PR_3857);

    setXY(value, x, y);
    
    setMarker(value,lonlat);

    map.setCenter(lonlat); // geolocation으로 얻어온 좌표로 지도의 중심을 설정합니다.
}

// 맵 클릭할 경우 마커 표시 메서드
function onClick(e){
    lonlat = map.getLonLatFromViewPortPx(e.xy).transform("EPSG:3857", "EPSG:4326");//클릭 부분의 ViewPortPx를 LonLat 좌표로 변환합니다.
    x = lonlat.lon;
    y = lonlat.lat;

    if(input_s == 0) {
        if(input_e == 0) {
            removeMarker("e");
            resetResult();
        }
        removeMarker("s");
        setLocation("#start", x, y, lonlat);
    } else if(input_e == 0) {
        removeMarker("e");
        setLocation("#end", x, y, lonlat);
    } else {
        removeMarker("s");
        removeMarker("e");
        reset();
    }
}

function resetResult() {
    $("#result").text("");
    $("#result1").text("");
    $("#result2").text("");
    $("#result3").text("");
    $(".preloader-wrapper").attr("class", "active");
}

function setLocation(value, x, y, lonlat) {
    if (value == "#start"){
        setXY("s", x, y);
        lonlat = lonlat.transform("EPSG:4326", "EPSG:3857"); //마커 정보 등록
        setMarker("s");
    } else if(value == "#end") {
        setXY("e", x, y);
        lonlat = lonlat.transform("EPSG:4326", "EPSG:3857"); //마커 정보 등록
        setMarker("e");
    }
}

function setMarker(value) {
    if(value == "s") {
        markerLayer_s.removeMarker(markerA);
        markerA = new Tmap.Marker(lonlat, icon_s); //마커 정보 등록
        markerLayer_s.addMarker(markerA);
    } else if(value == "e") {
        markerLayer_e.removeMarker(markerB);
        markerB = new Tmap.Marker(lonlat, icon_e);
        markerLayer_e.addMarker(markerB);
    }
}

function icon(value) {
    if(value != "s" && value != "e") {
        value == "s";
    }
    var size = new Tmap.Size(24, 38);
    var offset = new Tmap.Pixel(-(size.w / 2), -(size.h));
    var icon = new Tmap.IconHtml('<img src=http://tmapapis.sktelecom.com/upload/tmap/marker/pin_r_m_'+value+'.png />',size, offset);
    return icon;
}

function removeMarker(value) {
    if(value == "s") {
        markerLayer_s.removeMarker(markerA);
        markerA = null;
        start_x = null;
        start_y = null;
        $("#start").val("");
    } else if(value == "e") {
        markerLayer_e.removeMarker(markerB);
        markerB = null;
        end_x = null;
        end_y = null;
        $("#end").val("");
    }
}

function setXY(value, x, y) {
    if(value == "s") {
        start_x = x;
        start_y = y;
        searchAdress("#start", y, x);
    } else if(value == "e") {
        end_x = x;
        end_y = y;
        searchAdress("#end", y, x);
    } else {
        console.log("value Error");
    }
}

function reset () {
    $("#start").val(null);
    $("#end").val(null);
    removeMarker("s");
    removeMarker("e");
    endInputS();
    endInputE();
    resetResult();
    map.removeLayer(routeLayer);
}

function go() {
    if (input_s == 1 && input_e == 1) {
        distance();
    } else if(input_s == 0){
        alert("출발지를 등록하세요!");
    } else {
        alert("도착지를 등록하세요!");
    }
}

var headers = {}; 
headers["appKey"]="cadda216-ac54-435a-a8ea-a32ba3bb3356";//실행을 위한 키 입니다. 발급받으신 AppKey를 입력하세요.

function distance() {
    if (start_x != null && end_x != null) {
        $.ajax({
            method:"POST",
            headers:headers,
            url:"https://api2.sktelecom.com/tmap/routes?version=1",
            data:{
                startX:start_x,
                startY:start_y,
                endX:end_x,
                endY:end_y,
                reqCoordType : "WGS84GEO",
                resCoordType : "EPSG3857",
                angle:"172",
                searchOption:0
            },
            success:function(data) {
                var obj = JSON.stringify(data);
                obj = JSON.parse(obj);
                var total = obj.features[0].properties;
                var start = 0;
                var end;

                var time = "";
                if(total.totalTime > 3600) {
                    time = Math.floor(total.totalTime/3600) + "시간 " + Math.floor(total.totalTime%3600/60) + "분";
                } else {
                    time = Math.floor(total.totalTime%3600/60) + "분 ";
                }

                map.addLayer(routeLayer);
                routeLayer.removeAllFeatures();
                

                var vector_format = new Tmap.Format.GeoJSON().read(data); 
                
                routeLayer.addFeatures(vector_format);

                $("#result").text("소요 시간: " + time);
                $("#result1").text("거리: " + total.totalDistance/1000+ "km ");
                $("#result2").text("통행료: " + total.totalFare);
                $("#result3").text("택시비: " + total.taxiFare);
            },
            error:function(request,status,error){
                alert("출발지 혹은 도착지를 잘못 지정하였습니다.");
                reset();
                console.log("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
            }
        });
    }
}

function searchAdress(input, lat, lon) {
    $.ajax({
        method: "GET",
        url: "https://api2.sktelecom.com/tmap/geo/reversegeocoding?version=1",
        data: {
          lat: lat,
          lon: lon,
          appKey: headers["appKey"]
        },
        success: function(data) {
            if(data != undefined) {
            var obj = JSON.stringify(data);
            obj = JSON.parse(obj);
            } else {
                alertAdress(input);
            }
            $(input).val(obj.addressInfo.fullAddress);
        },
        error:function(request,status,error){
            alertAdress(input);
            console.log("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
        }
    });
}

function alertAdress(input) {
    alert("제공되지 않는 주소 범위입니다.");
        if(input == "#start") {
            removeMarker("s");
        } else {
            removeMarker("e");
        }
}

function search(input) {
    if($(input).val()=="") {
        alert("입력값이 없습니다.");
    } else {
        textSearch(input, $(input).val());
    }
}

function textSearch(input, add) {
    if($(input).val() != null) {
        $.ajax({
            method: "GET",
            url: "https://api2.sktelecom.com/tmap/geo/fullAddrGeo?version=1",
            data: {
               fullAddr: add,
               appKey: headers["appKey"]
            },
            success: function(data) {
                var obj = JSON.stringify(data);
                obj = JSON.parse(obj);

                if(obj.coordinateInfo != undefined) {
                   var coordinate = obj.coordinateInfo.coordinate[0];
                   if(coordinate.lon != "") {
                       console.log(coordinate.lon);
                        sOrE(input, coordinate.lon, coordinate.lat);
                   } else if(coordinate.newLon != "") {
                       console.log(coordinate.newLon);
                        sOrE(input, coordinate.newLon, coordinate.newLat);
                   }
                } else {
                    if (input == "#start") {
                        alert("출발지 주소가 잘못되었습니다.");
                    } else {
                        alert("도착지 주소가 잘못되었습니다.");
                    }
                }
            },
            error:function(request,status,error){
                console.log("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
                
            }
        });
    }
}

function sOrE (input, x, y) {
    if(input == "#start") {
        start_x = x;
        start_y = y;
        startInputS();
        moveCoordinate("s", x,y);
    } else if(input == "#end") {
        end_x = x;
        end_y = y;
        startInputE();
        moveCoordinate("e", x,y);
    } else {
        alert("잘못된 값을 입력하셨습니다.");
    }
}

function startInputS() {
    input_s = 1;
}

function endInputS() {
    input_s = 0;
}

function startInputE() {
    input_e = 1;
}

function endInputE() {
    input_e = 0;
}

