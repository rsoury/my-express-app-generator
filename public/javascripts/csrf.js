import $ from 'jquery';

const csrf = $("#csrf").val() || $("#csrf").attr('value');
if(csrf) {
    $.ajaxPrefilter((options, _, xhr) => {
        if (!xhr.crossDomain) {
            xhr.setRequestHeader('X-CSRF-Token', csrf);
        }
    });
}
export default $;