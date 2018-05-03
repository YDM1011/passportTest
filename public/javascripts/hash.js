if (window.location.hash == "#_=_"){
    $.ajax({
        type: 'POST',
        contentType: 'application/json',
        url: '/hash',
        success: function(data){
            data = JSON.parse(data)
            window.location.href = `${window.location.origin}/${data.id}`;
        }
    });
}