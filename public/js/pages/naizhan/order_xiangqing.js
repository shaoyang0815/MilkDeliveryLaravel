/*
 * Stop Order
 */

$('#stop_order_modal_form').submit(function (e) {

    e.preventDefault();

    var submit = $(this).find('button[type="submit"]');
    $(submit).prop('disabled', true);

    var sendData = $(this).serializeArray();

    $.ajax({
        type: "POST",
        url: API_URL + "naizhan/dingdan/stop_order",
        data: sendData,
        success: function (data) {
            if (data.status == 'success') {
                var stop_start_date = data.stop_start;
                var stop_end_date = data.stop_end;

                show_success_msg("停止订单成功: " + stop_start_date + " ~ " + stop_end_date);

                var stopped_start = new Date(stop_start_date);
                var stopped_end = new Date(stop_end_date);
                //compare today with stop start-end: go to zanting
                if (stopped_start < today && stopped_end > today) {
                    var url = SITE_URL + "naizhan/dingdan/zantingliebiao";
                    window.location.replace(url);
                }

                location.reload();

            } else {
                if (data.message)
                    show_warning_msg("停止订单失败: " + data.message);
                else
                    show_warning_msg("停止订单失败.");
            }

            $('#stop_order_modal').modal('hide');
            $(submit).prop('disabled', false);
        },
        error: function (data) {
            console.log(data);
        }
    });
});

/*
 *  Restart Order
 */

$('body').on('click', 'button#restart_order_bt', function (e) {
    e.preventDefault();

    var order_id = $(this).data('orderid');
    var stop_at = $(this).data('stop-at');
    var restart_at = $(this).data('restart-at');

    $('#restart_order_id').val(order_id);

    var period = stop_at + " ~ " + restart_at;
    $('#stop_period').text(period);

    $('#restart_order_modal').show();

});

$('#restart_order_modal_form').submit(function (e) {

    e.preventDefault();

    var submit = $(this).find('button[type="submit"]');
    $(submit).prop('disabled', true);
    var sendData = $(this).serializeArray();
    console.log(sendData);

    $.ajax({
        type: "POST",
        url: API_URL + "naizhan/dingdan/restart_order",
        data: sendData,
        success: function (data) {
            console.log(data);
            if (data.status == 'success') {
                $('#restart_order_modal').modal('hide');
                $(submit).prop('disabled', true);

                show_success_msg("开启订单成功");

                if (data.restart_at && data.restart_at == today) {
                    var url = SITE_URL + "naizhan/dingdan/daishenhes";
                    window.location.replace(url);
                } else {
                    location.reload();
                }

            } else {
                $('#restart_order_modal').modal('hide');
                $(submit).prop('disabled', false);
                show_warning_msg("开启订单失败. " + data.message);
            }
        },
        error: function (data) {
            console.log(data);
            $(submit).prop('disabled', true);
        }
    });
});


/*
 *  Cancel Order
 */

$('#cancel_order_bt').click(function () {
    $.confirm({
        icon: 'fa fa-warning',
        title: '取消订单',
        text: '您确定要取消此订单吗?',
        confirmButton: "是",
        cancelButton: "不",
        confirmButtonClass: "btn-success",
        confirm: function () {
            cancel_order();
        },
        cancel: function () {
            return;
        }
    });
});

function cancel_order() {
    var order_id = $('#cancel_order_bt').data("orderid");
    var sendData = {'order_id': order_id};
    $.ajax({
        type: "POST",
        url: API_URL + "naizhan/dingdan/cancel_order",
        data: sendData,
        success: function (data) {
            console.log(data);
            if (data.status = 'success') {
                show_success_msg('取消订单成功');
                //go to the quanbuluru
                var url = SITE_URL + "naizhan/dingdan/quanbuluru";
                window.location.replace(url);
            } else {
                if (data.message)
                    show_warning_msg(data.message);
            }
        },
        error: function (data) {
            console.log(data);
        }
    });
}

/*
 * Postpone Order: 1 day
 */

$('#postpone_order_bt').click(function () {
    $.confirm({
        icon: 'fa fa-warning',
        title: '顺延订单',
        text: '您确定要顺延此订单吗?',
        confirmButton: "是",
        cancelButton: "不",
        confirmButtonClass: "btn-success",
        confirm: function () {
            postpone();
        },
        cancel: function () {
            return;
        }
    });
});

function postpone() {
    var order_id = $('#postpone_order_bt').data("orderid");
    var sendData = {'order_id': order_id};
    $.ajax({
        type: "POST",
        url: API_URL + "naizhan/dingdan/postpone_order",
        data: sendData,
        success: function (data) {
            console.log(data);
            if (data.status = 'success') {
                show_success_msg("顺延订单成功");
                //refresh current page
                location.reload();
            } else {
                if (data.message)
                    show_warning_msg(data.message);
            }
        },
        error: function (data) {
            console.log(data);
        }
    });
}

/*
 * Change delivery plan for one day
 *
 * */
//Change one product's order status
$('body').on('change', 'input.plan_count', function () {

    var tr = $(this).closest('tr');
    var origin_plan_count = $(this).attr("origin_plan_count");
    var change_bt = $(tr).find('.xiugai_plan_bt');

    var changed_plan_count = parseInt($(this).val());

    if (changed_plan_count < 0) {
        $(this).val(origin_plan_count);
        $(change_bt).prop("disabled", true);
    } else {
        if (changed_plan_count != origin_plan_count) {
            $(change_bt).prop("disabled", false);
        } else {
            $(change_bt).prop("disabled", true);
        }
    }

});

$('body').on('click', 'button.xiugai_plan_bt', function () {
    var tr = $(this).closest('tr');
    var plan_id = $(tr).data("planid");
    var plan_input = $(tr).find('input.plan_count');

    var change_bt = $(this);

    var order_id = $('#order_id').val();

    var changed_plan_count = $(plan_input).val();
    var origin_plan_count = $(plan_input).attr("origin_plan_count");

    if (changed_plan_count == origin_plan_count) {
        $(this).prop("disabled", true);
        return;
    } else {
        var sendData = {
            'order_id': order_id,
            'plan_id': plan_id,
            'origin': origin_plan_count,
            'changed': changed_plan_count
        };

        console.log(sendData);

        $.ajax({
            type: "POST",
            url: API_URL + 'naizhan/dingdan/change_delivery_plan_for_one_day_in_xiangqing_and_xiugai',
            data: sendData,
            success: function (data) {
                console.log(data);

                if (data.status == "success") {
                    if (data.message)
                        show_success_msg(data.message);

                    location.reload();
                } else {
                    if(data.message)
                        show_warning_msg(data.message);

                    $(plan_input).val(origin_plan_count);
                    $(change_bt).prop("disabled", true);
                }
            },
            error: function (data) {
                console.log(data);
            }
        })

    }
});
/*
 * Stop Order
 */

$('#stop_order_modal_form').submit(function (e) {

    e.preventDefault();

    var submit = $(this).find('button[type="submit"]');
    $(submit).prop('disabled', true);

    var sendData = $(this).serializeArray();

    $.ajax({
        type: "POST",
        url: API_URL + "naizhan/dingdan/stop_order",
        data: sendData,
        success: function (data) {
            if (data.status == 'success') {
                var stop_start_date = data.stop_start;
                var stop_end_date = data.stop_end;

                show_success_msg("停止订单成功: " + stop_start_date + " ~ " + stop_end_date);

                var stopped_start = new Date(stop_start_date);
                var stopped_end = new Date(stop_end_date);
                //compare today with stop start-end: go to zanting
                if (stopped_start < today && stopped_end > today) {
                    var url = SITE_URL + "naizhan/dingdan/zantingliebiao";
                    window.location.replace(url);
                }

                location.reload();

            } else {
                if (data.message)
                    show_warning_msg("停止订单失败: " + data.message);
                else
                    show_warning_msg("停止订单失败.");
            }

            $('#stop_order_modal').modal('hide');
            $(submit).prop('disabled', false);
        },
        error: function (data) {
            console.log(data);
        }
    });
});

/*
 *  Restart Order
 */

$('body').on('click', 'button#restart_order_bt', function (e) {
    e.preventDefault();

    var order_id = $(this).data('orderid');
    var stop_at = $(this).data('stop-at');
    var restart_at = $(this).data('restart-at');

    $('#restart_order_id').val(order_id);

    var period = stop_at + " ~ " + restart_at;
    $('#stop_period').text(period);

    $('#restart_order_modal').show();

});

$('#restart_order_modal_form').submit(function (e) {

    e.preventDefault();

    var submit = $(this).find('button[type="submit"]');
    $(submit).prop('disabled', true);
    var sendData = $(this).serializeArray();
    console.log(sendData);

    $.ajax({
        type: "POST",
        url: API_URL + "naizhan/dingdan/restart_order",
        data: sendData,
        success: function (data) {
            console.log(data);
            if (data.status == 'success') {
                $('#restart_order_modal').modal('hide');
                $(submit).prop('disabled', true);

                show_success_msg("开启订单成功");

                if (data.restart_at && data.restart_at == today) {
                    var url = SITE_URL + "naizhan/dingdan/daishenhes";
                    window.location.replace(url);
                } else {
                    location.reload();
                }

            } else {
                $('#restart_order_modal').modal('hide');
                $(submit).prop('disabled', false);
                show_warning_msg("开启订单失败. " + data.message);
            }
        },
        error: function (data) {
            console.log(data);
            $(submit).prop('disabled', true);
        }
    });
});


/*
 *  Cancel Order
 */

$('#cancel_order_bt').click(function () {
    $.confirm({
        icon: 'fa fa-warning',
        title: '取消订单',
        text: '您确定要取消此订单吗?',
        confirmButton: "是",
        cancelButton: "不",
        confirmButtonClass: "btn-success",
        confirm: function () {
            cancel_order();
        },
        cancel: function () {
            return;
        }
    });
});

function cancel_order() {
    var order_id = $('#cancel_order_bt').data("orderid");
    var sendData = {'order_id': order_id};
    $.ajax({
        type: "POST",
        url: API_URL + "naizhan/dingdan/cancel_order",
        data: sendData,
        success: function (data) {
            console.log(data);
            if (data.status = 'success') {
                show_success_msg('取消订单成功');
                //go to the quanbuluru
                var url = SITE_URL + "naizhan/dingdan/quanbuluru";
                window.location.replace(url);
            } else {
                if (data.message)
                    show_warning_msg(data.message);
            }
        },
        error: function (data) {
            console.log(data);
        }
    });
}

/*
 * Postpone Order: 1 day
 */

$('#postpone_order_bt').click(function () {
    $.confirm({
        icon: 'fa fa-warning',
        title: '顺延订单',
        text: '您确定要顺延此订单吗?',
        confirmButton: "是",
        cancelButton: "不",
        confirmButtonClass: "btn-success",
        confirm: function () {
            postpone();
        },
        cancel: function () {
            return;
        }
    });
});

function postpone() {
    var order_id = $('#postpone_order_bt').data("orderid");
    var sendData = {'order_id': order_id};
    $.ajax({
        type: "POST",
        url: API_URL + "naizhan/dingdan/postpone_order",
        data: sendData,
        success: function (data) {
            console.log(data);
            if (data.status = 'success') {
                show_success_msg("顺延订单成功");
                //refresh current page
                location.reload();
            } else {
                if (data.message)
                    show_warning_msg(data.message);
            }
        },
        error: function (data) {
            console.log(data);
        }
    });
}

/*
 * Change delivery plan for one day
 *
 * */
//Change one product's order status
$('body').on('change', 'input.plan_count', function () {

    var tr = $(this).closest('tr');
    var origin_plan_count = $(this).attr("origin_plan_count");
    var change_bt = $(tr).find('.xiugai_plan_bt');

    var changed_plan_count = parseInt($(this).val());

    if (changed_plan_count < 0) {
        $(this).val(origin_plan_count);
        $(change_bt).prop("disabled", true);
    } else {
        if (changed_plan_count != origin_plan_count) {
            $(change_bt).prop("disabled", false);
        } else {
            $(change_bt).prop("disabled", true);
        }
    }

});

$('body').on('click', 'button.xiugai_plan_bt', function () {
    var tr = $(this).closest('tr');
    var plan_id = $(tr).data("planid");
    var plan_input = $(tr).find('input.plan_count');

    var change_bt = $(this);

    var order_id = $('#order_id').val();

    var changed_plan_count = $(plan_input).val();
    var origin_plan_count = $(plan_input).attr("origin_plan_count");

    if (changed_plan_count == origin_plan_count) {
        $(this).prop("disabled", true);
        return;
    } else {
        var sendData = {
            'order_id': order_id,
            'plan_id': plan_id,
            'origin': origin_plan_count,
            'changed': changed_plan_count
        };

        console.log(sendData);

        $.ajax({
            type: "POST",
            url: API_URL + 'naizhan/dingdan/change_delivery_plan_for_one_day_in_xiangqing_and_xiugai',
            data: sendData,
            success: function (data) {
                console.log(data);

                if (data.status == "success") {
                    if (data.message)
                        show_success_msg(data.message);

                    location.reload();
                } else {
                    if(data.message)
                        show_warning_msg(data.message);

                    $(plan_input).val(origin_plan_count);
                    $(change_bt).prop("disabled", true);
                }
            },
            error: function (data) {
                console.log(data);
            }
        })

    }
});


$('button.show_delivery_date').click(function(){

    var ob1 = $(this).parent().find('.input-group-addon');
    $(ob1).trigger('click');
});
//Show delivery date on calendar
function initBottleNumCalendar(tr) {
    var calendar = tr.find('.calendar_show')[0];

    var selectDeliveryType = tr.find('.order_delivery_type')[0];
    var pick = tr.find('.picker')[0];

    // 获取输入的每次瓶数
    var inputBottleNum = tr.find('.order_product_count_per')[0];
    var nBottleNum = parseInt($(inputBottleNum).text());

    var id = $(selectDeliveryType).data('type');

    if (id == 3 || id == 4) {

        var initNum = $(calendar).find('input').val();

        if (id == 3) {
            console.log(id);
            //show weekday
            $(pick).datepicker({
                multidate: true,
                todayBtn: false,
                clearBtn: false,
                keyboardNavigation: false,
                forceParse: false,
                calendarWeeks: false,
                showNum: true,
                bottleNum: nBottleNum,
                initValue: initNum,
                startDate: firstday,
                endDate: lastday,
                class:'week_calendar only_show',
            });
        }
        else {
            console.log(id);
            //show monthday
            $(pick).datepicker({
                multidate: true,
                todayBtn: false,
                clearBtn: false,
                keyboardNavigation: false,
                forceParse: false,
                calendarWeeks: false,
                showNum: true,
                bottleNum: nBottleNum,
                initValue: initNum,
                startDate: firstm,
                endDate: lastm,
                class:'month_calendar only_show',
            });

        }

        $(calendar).find('input').prop('disabled', true);

    } else {
        $(calendar).hide();
    }
}