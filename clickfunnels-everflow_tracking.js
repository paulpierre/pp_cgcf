/** ----------------------------------------------
 *  Postback Manager - For Everflow.io
 *  by paul@pixel6.net - 06/24/2018
 *  ----------------------------------------------
 *  Manages Everflow tracking and Network Postbacks for any landing page
 **/



var current_page,
    current_site,
    transaction_id,
    mid_type,
    page_type = cg_funnel,
    product_price = cg_product_price
    oto_step = cg_oto_step,
    order_id = cg_order_id,
    session_id = cg_session_id;

var _submit = false;


$( document ).ready(function() {


    /**
     *  Lets set all the page and funnel variables up where they apply
     */

    var _d = window.location.hostname.split('.');
    current_site = _d[_d.length-2];

    if(!page_type &&
        uparam("offer_id") != null &&
        //(uparam("transactionid") != null || uparam("sub2") != null)  &&
        uparam("affiliate_id") != null)
        page_type = "lander";


    /**
     *  Lets spit out status information for debugging purposes
     */

    console.log(
        "\ncurrent_page: " + current_page +
        "\ncurrent_site: " + current_site +
        "\nproduct_price: " + product_price +
        "\norder_id: " + order_id +
        "\nsession_id: " + session_id +
        "\npage_type: " + page_type +
        "\noto_step: " + oto_step +
        "\n\nrc(offer_id): " + rc("offer_id") + " rc(transaction_id): " + rc("transaction_id") + " rc(rc(transaction_id)): " + rc(rc("transaction_id"))  +" rc(affiliate_id): " + rc("affiliate_id") + " rc(pid): " + rc("pid") + " rc(fid): " + rc("fid") + " rc(oid): " + rc("oid")
    );


    /**
     *  Lets take action depending on which page we are on
     */

    switch(page_type) {
        case  "lander":

            if (uparam("transaction_id") !== null) transaction_id = uparam("transaction_id");
            else if (uparam("sub2") !== null) transaction_id = uparam("sub2");

            wc("transaction_id",transaction_id);

            if (uparam("mid") !== null) wc("mid_type",uparam("mid"));//transaction_id = uparam("mid_type");


            //In the lander, lets just save the URL parameters as cookies
            if(uparam("offer_id") !== null) wc("offer_id", uparam("offer_id"));
            if(typeof order_id !== "undefined") wc("order_id",order_id);
            if(typeof session_id !== "undefined") wc("session_id",order_id);
            wc("transaction_id", transaction_id);


            if(uparam("affiliate_id") !== null) wc("affiliate_id", uparam("affiliate_id"));
            if(uparam("pid") !==null) wc("pid",uparam("pid"));
            break;

        case "order":

            wc("product_price",product_price);
            $("#affiliate_id").val(rc("affiliate_id"));
            $("#transaction_id").val(rc("transaction_id"));
            $("#publisher_id").val(rc("pid"));

            $('body').on('click','.product-selector,[name="product_qty"]',function(e){
                product_price = $(this).attr("data-product-amount");
                wc("product_price",product_price);
                console.log("product_price: " +  product_price);
            });

        break;

        case "oto":


            product_price = rc("product_price");
            var oto_key = rc("transaction_id") + "_oto_" + oto_step;
            var order_payout = rc("order_payout");
            if(!order_payout) order_payout = rc("product_price");

            var did_fire_order = rc("order_" + rc("transaction_id"));
            if(did_fire_order != 1)
            {
                console.log("**FIRE** order_payout: " + order_payout);
                _i = new Image();


                var mid_id,mid_type, _s = new Image(),_i = new Image();

                _i.src = "https://c###########/?nid=###########&oid=" + rc("offer_id") + "&transaction_id=" + rc("transaction_id") + "&amount=" + order_payout + "&adv1=" + mid_type + "&adv2=" + cg_order_id + "&adv3=" + cg_session_id + "&adv4=" + rc("pid") + "&adv5=" + rc("affiliate_id");
                //wc("order_" + rc("offer_id"),1);
                wc("order_" + rc("transaction_id"),1);


            }


            break;



        case "thankyou":
            //Nothing should happen on the thank you page
            break;

        default:
            break;
    }
});

function cg_proceed()
{
    switch(page_type)
    {
        case "oto":
            if (!_submit) {
                _submit = true;//
                var oto_key = rc("transaction_id") + "_oto_" + oto_step;
                _url = $(this).attr("href");
                    _o = new Image();
                _o.onload = function () {
                    wc(oto_key, "1");
                    window.location = cg_next_page;
                }
                _o.onerror = function () {
                    wc(oto_key, "1");
                    window.location = cg_next_page;
                }

                var event_id = cg_ef_event_id;// (typeof CG_FUNNELS[current_site]["page"][funnel_id]["event_id"][oto_step - 1] != "undefined")?CG_FUNNELS[current_site]["page"][funnel_id]["event_id"][oto_step - 1]:null;
                if (rc(oto_key) == "1") _o.src = "https://www.google.com";
                else {
                    _o.src = "https://###########/?nid=###########&event_id=" + (event_id) + "&oid=" + rc("offer_id") + "&transaction_id=" + rc("transaction_id") +  "&amount=" + cg_product_price +"&adv1=" + mid_type + "&adv2=" + cg_order_id + "&adv3=" + cg_session_id + "&adv4=" + rc("pid") + "&adv5=" + rc("affiliate_id");
                    console.log("**** OTO FIRE ****" + "https://###########/?nid=###########&event_id=" + (event_id) + "&oid=" + rc("offer_id") + "&transaction_id=" + rc("transaction_id"));
                }
            }
        break;

        default:
            window.location = cg_next_page;
            break;
    }
}


