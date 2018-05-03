window.sendChange = (e,obj,url) => {
    e.preventDefault()
    $(`#${e.target.id} input`).val('');
    $.ajax({
        type: "POST",
        url: url,
        data: JSON.stringify(obj),
        dataType: "json",
        contentType: "application/json",
        success: function(data){
            console.log(data);
            $(`#nameBtn input`).attr("placeholder", data)
        }
    });
};

