/** -------------------------------
 *  Postback Manager - for Voluum
 *  by paul@pixel6.net - 02/15/2018
 *  -------------------------------
 *  Manages Voluum tracking and Network Postbacks on Click Funnels
 **/

/** -------------
 *  CONFIGURATION
 *  ------------- */


var CG_FUNNELS = {

    "###########":{ //enter the name of the site name, e.g. if the site is www.poop.com, the entry here is "poop"
        "pixel":
            {
                //enter voluum campaign ID here, second part is the 3rd party pixel you wish to fire
                "###########-###########-###########-###########-###########":"###########",

                //"186cc88d-0427-47d2-8dfa-4fce99904e3f":"https://eng.trkcnv.com/pixel?cid=22126&refid=ORDER_PURCHASE&clickid=", //W4 SG Direct to Cart check campaign id
                //"186cc88d-0427-47d2-8dfa-4fce99904e3f":"https://eng.trkcnv.com/pixel?cid=22126&refid=ORDER_PURCHASE&clickid=" // W4 SG LP to cart
            },
        "page":
            {
                /** ----------------------------------
                 *  FUNNEL - Funnel name
                 *  ----------------------------------*/
                "###########": //Page-ID 
                    {
                        //OTO #1
                        "###########":
                            {
                                "###########": 20.00, //OTO 1
                                "###########": 10.00, //OTO 2
                                "###########": 39.99, //OTO 3
                                "###########": 39.99 //OTO 4
                            }
                    }
            }
    }
};


var funnel_id,
    page_id,
    order_id,
    current_page,
    current_site,
    page_type,
    current_page_id,
    network_pixel,
    oto_price,
    oto_step,
    order_payout;



$( document ).ready(function() {

    page_id = $("#page-id").val();
    current_page = cf_get_page();

    page_type = false;

    /**
     *  Lets determine which page we are on
     */

    if(current_page.substring(0,9) == "oto-page-") page_type = "oto";
    if(current_page.substring(0,4) == "oto-") page_type = "oto";

    if(current_page.substring(0,5) == "order") page_type = "order";
    if(current_page.substring(0,5) == "trial") page_type = "order";
    if(current_page.substring(0,14) == "thank-you-page") page_type = "ty";
    if(current_page.substring(0,11) == "sales-page-") page_type = "lander";
    if(current_page.substring(0,11) == "free-trial-") page_type = "lander";


    /**
     *  Lets set all the page and funnel variables up where they apply
     */

    funnel_id = cf_get_funnel_id();
    order_id = cf_get_order_id();



    var _d = window.location.hostname.split('.');
    current_site = _d[_d.length-2];



    if(!page_type &&
        uparam("cid") != null &&
        //(uparam("clickid") != null || uparam("sub2") != null)  &&
        uparam("ts") != null)
        page_type = "lander";

    current_page_id = $("input#page-id").val();

    network_pixel = (typeof CG_FUNNELS[current_site] != "undefined" &&
        typeof CG_FUNNELS[current_site]["pixel"][rc("ts")] != "undefined")?CG_FUNNELS[current_site]["pixel"][rc("ts")]:false;

    oto_price = (
        page_type == "oto" &&
        typeof CG_FUNNELS[current_site]["page"][funnel_id] != "undefined" &&
        typeof CG_FUNNELS[current_site]["page"][funnel_id][order_id] != "undefined" &&
        typeof CG_FUNNELS[current_site]["page"][funnel_id][order_id][page_id] != "undefined"
    )?CG_FUNNELS[current_site]["page"][funnel_id][order_id][page_id]:false;

    oto_step = get_oto_step();

    /**
     *  Lets spit out status information for debugging purposes
     */

    console.log(
        "funnel_id: " + funnel_id +
        "\norder_id: " + order_id +
        "\ncurrent_page: " + current_page +
        "\ncurrent_site: " + current_site +
        "\npage_type: " + page_type +
        "\nnetwork_pixel: " + network_pixel +
        "\npage_id: " + page_id +
        "\n\n" + "oto_price: " + oto_price +
        "\noto_step: " + oto_step +
        "\n\nrc(cid): " + rc("cid") + " rc(ext): " + rc("ext") + " rc(rc(ext)): " + rc(rc("ext"))  +" rc(ts): " + rc("ts") + " rc(fid): " + rc("fid") + " rc(oid): " + rc("oid")
    );


    /**
     *  Lets take action depending on which page we are on
     */

    switch(page_type) {
        case  "lander":

            var _ext;
            if (uparam("clickid") !== null) _ext = uparam("clickid");
            else if (uparam("sub2") !== null) _ext = uparam("sub2");
            else if(rc("cf:visitor_id")) _ext = rc("cf:visitor_id");

            //In the lander, lets just save the URL parameters as cookies
            if(uparam("cid") !== null) wc("cid", uparam("cid"));
            wc("ext", _ext);
            if(uparam("ts") !== null) wc("ts", uparam("ts"));
            break;

        case "order":

            order_payout = $("input:checked", "#cfAR").attr("data-product-amount");
            wc("order_payout",order_payout);

            $('input[type=radio]').change(function() {
                order_payout = $("input:checked", "#cfAR").attr("data-product-amount");
                wc("order_payout",order_payout);
                console.log(order_payout);
            });

        break;

        case "oto":

            order_payout = rc("order_payout");
            //Lets fire the order conversion pixel to voluum
            var did_fire_order = rc("order_" + rc("cid"));
            if(did_fire_order != 1)
            {

                console.log("**FIRE** order_payout: " + order_payout);
                _i = new Image();
                _i.src = "http://###########/conversion.gif?cid=" + rc("cid") + "&txid=ORDER_PURCHASE&et=order&payout=" + order_payout;
                wc("order_" + rc("cid"),1);

                /**
                 *  MID transaction ID processing
                 */
                var mid_id, _s = new Image(),_i = new Image(),_submit = false;


                //we can track and fire conversion at the purchase level
                switch(current_site)
                {
                    //stripe
                    case '###########': //if a different product site uses stripe, add the case here
                        try {
                            mid_id = JSON.parse($("a[data-purchase]").attr("data-purchase"))["stripe_customer_id"];
                        } catch (e) {
                            var mid_id = "stripe_id_error";
                        }
                        _s.src = "http://###########/conversion.gif?cid=" + rc("cid") + "&et=stripe&txid=" + mid_id;
                    break;

                    //NMI. We default to NMI
                    default:
                        try {
                            mid_id = JSON.parse($("a[data-purchase]").attr("data-purchase"))["nmi_customer_vault_id"];
                        } catch (e) {
                            var mid_id = "nmi_id_error";
                        }
                        _s.src = "http://###########/conversion.gif?cid=" + rc("cid") + "&et=nmi&txid=" + mid_id;
                    break;
                }


                if (rc(rc("ext")) !=1 && network_pixel) {

                    //_i.src = network_pixel + rc("ext");

                    var _if = document.createElement('iframe');
                    _if.style.display = "none";
                    _if.src = network_pixel + rc("ext");
                    document.body.appendChild(_if);
                    console.log("** FIRING TO NETWORK: " + network_pixel + rc("ext"));

                    wc(rc("ext"), 1);
                }
            }

            console.log("order_" + rc("cid") + ": " +  did_fire_order)

            $("#cfAR").submit(function (e) {
                if (!_submit) {
                    e.preventDefault();
                    _submit = true;
                    var oto_key = rc("cid") + "_oto_" + oto_step, //v2
                        _url = $(this).attr("href"),
                        _o = new Image();
                    _o.onload = function () {
                        wc(oto_key, "1");
                        $("#cfAR").submit();
                    }
                    _o.onerror = function () {
                        wc(oto_key, "1");
                        $("#cfAR").submit();
                    }
                    if (rc(oto_key) == "1") _o.src = "https://www.google.com";
                    else _o.src = "http://###########/conversion.gif?cid=" + rc("cid") + "&txid=OTO" + oto_step + "_PURCHASE&et=oto" + oto_step + "&payout=" + oto_price;
                }
            });


            break;



        case "ty":
            //Nothing should happen on the thank you page
            break;

        default:
            break;
    }
});





function cf_get_page()
{
    var path = window.location.pathname;
    var page = path.split("/").pop();
    if (!page)
    {
        return path.replace(/\//g,"");
    }

    else
        return page;
}

function get_oto_step()
{
    if(
        !page_id ||
        !funnel_id ||
        !order_id ||
        typeof CG_FUNNELS[current_site]["page"][funnel_id] == "undefined" &&
        typeof CG_FUNNELS[current_site]["page"][funnel_id][order_id] == "undefined"
    )
        return false;

    var i = 1;
    for(var o in CG_FUNNELS[current_site]["page"][funnel_id][order_id]) {
        //console.log(o);
        if(o === page_id)
            return i;
        i++;
    }
    return false;
}

function cf_get_funnel_id()
{
    if(page_type != "order" && page_type !="lander")
        return rc("fid");

    var match = /(?:fid = ')(.*)(?=';)/g.exec($("body").html());
    if(!match) return false;
    wc("fid",parseInt(match[1]));
    return parseInt(match[1]);
}

function cf_get_order_id()
{

    if(page_type != "order" && rc("oid") != null)
        return rc("oid");

    if(page_id) wc("oid",page_id);
    return page_id;
}

function wc(cname, cvalue)
{
    var d = new Date();
    d.setTime(d.getTime() + (7 * 24 * 60 * 60 * 1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function rc(cname)
{
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return false;
}

function uparam(name, url) {
    if (!url) url = window.location.href;
    if(!name) return null;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}
