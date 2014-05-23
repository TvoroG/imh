function social(u,t) {

	var m1 = 100; /* СЂР°СЃСЃС‚РѕСЏРЅРёРµ РѕС‚ РЅР°С‡Р°Р»Р° СЃС‚СЂР°РЅРёС†С‹ РґРѕ РїР»Р°РІР°СЋС‰РµР№ РїР°РЅРµР»Рё */
	var m2 = 20; /* СЂР°СЃСЃС‚РѕСЏРЅРёРµ РѕС‚ РІРµСЂС…Р° РІРёРґРёРјРѕР№ РѕР±Р»Р°СЃС‚Рё СЃС‚СЂР°РЅРёС†С‹ РґРѕ РїР»Р°РІР°СЋС‰РµР№ РїР°РЅРµР»Рё */
	var f = '/img/sn/'; /* РїСѓС‚СЊ Рє РїР°РїРєРµ СЃ РёР·РѕР±СЂР°Р¶РµРЅРёСЏРјРё РєРЅРѕРїРѕРє */

	document.write('<div id="social"></div>');

	(function($) {
	$(function() {

		var s = $('#social');
		s.css({top: m1});
		function margin() {
			var top = $(window).scrollTop();
			if (top+m2 < m1) {
				s.css({top: m1-top});
			} else {
				s.css({top: m2});
			}
		}
		$(window).scroll(function() { margin(); });

		s.append(
			'<a rel="nofollow" href="http://twitter.com/share?text=' + t + '&url=' + u + '" title="Р”РѕР±Р°РІРёС‚СЊ РІ Twitter"><img src="' + f + 'twitter.png" alt="" /></a>' +
//			'<a rel="nofollow" href="http://www.google.com/buzz/post?message=' + t + '&url=' + u + '" title="Р”РѕР±Р°РІРёС‚СЊ РІ Google Buzz"><img src="' + f + 'google-buzz.png" alt="" /></a>' +
			'<a rel="nofollow" href="http://www.facebook.com/sharer.php?u=' + u + '" title="РџРѕРґРµР»РёС‚СЊСЃСЏ РІ Facebook"><img src="' + f + 'facebook.png" alt="" /></a>' +
			'<a rel="nofollow" href="http://vkontakte.ru/share.php?url=' + u + '" title="РџРѕРґРµР»РёС‚СЊСЃСЏ Р’РљРѕРЅС‚Р°РєС‚Рµ"><img src="' + f + 'vkontakte.png" alt="" /></a>' +
			'<a rel="nofollow" href="http://connect.mail.ru/share?share_url=' + u + '" title="РџРѕРґРµР»РёС‚СЊСЃСЏ РІ РњРѕРµРј РњРёСЂРµ"><img src="' + f + 'moy-mir.png" alt="" /></a>' +
			'<a rel="nofollow" href="http://www.google.com/bookmarks/mark?op=edit&output=popup&bkmk=' + u + '&title=' + t + '" title="РЎРѕС…СЂР°РЅРёС‚СЊ Р·Р°РєР»Р°РґРєСѓ РІ Google"><img src="' + f + 'google.png" alt="" /></a>' +
//			'<a rel="nofollow" href="http://feeds.feedburner.com/"><img src="' + f + 'rss.png" alt="" /></a>' +
		'');

/*		s.find('a').attr({target: '_blank'}).css({opacity: 0.5}).hover(
			function() { $(this).css({opacity: 1}); },
			function() { $(this).css({opacity: 0.5}); }
		);
		s.hover(
			function() { $(this).find('a').css({opacity: 1}); },
			function() { $(this).find('a').css({opacity: 0.5}); }
		);*/

	})
	})(jQuery)

};
social(encodeURIComponent(document.URL),encodeURIComponent(document.title));