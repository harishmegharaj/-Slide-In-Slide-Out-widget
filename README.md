<<<<<<< HEAD
# Mendix Widget Boilerplate

See [AppStoreWidgetBoilerplate](https://github.com/mendix/AppStoreWidgetBoilerplate/) for an example
=======
# Slide-In-Slide-Out-widget

A simple but effective widget to show extra optional information on a page, like notifications of the user or FAQ.You click on the button on the side and a page will slide out showing content you define in the Mendix model.

The widget contains three variants: plane, context and FAQ. The way of working of each variant is the same, but the context that will be given is different. The construction is completely flexible. In the configuration of the widget in the Mendix model you refer to the page you want to show and the content is up to you. Placing multiple variants on a page/layout is possible. With the priority property the sorting of the widgets is given. The widget calculate the positions each variant will need and add extra 5 pixel between each variant, so sorting of the widgets in the page and therefor the loaiding sequence doesn't care because the priority will always bee used.

#Slide Out Plane

The plane variant if the simplest version. It isn't linked to any context, therefor the configuration is static. In the page no dataview can be used or it has a microflow as datasource.

#Slide Out Context

The context variant uses the object of the dataview where it's standing. The content is there dynamic: the name of the button uses placeholders (same construction as the Format String widget) and pushes the object to the page that will be shown in the widget. This variant is very usable for showing a 'Notification' functionality containing the amount of unread messages.

#Slide Out FAQ

The last variant solves a problem what a lot of site has, you don't know what you have to do on that page, but the help function explains of everything of the site and searching content about the current page is difficult. This variant searches on which Mendix page you on and pushes that to the content of the variant. In your app you will need to link your help data to each page and the user will see help content about each page he is on.

#Typical usage scenario

Notification column that will slide in containing the unread messages.
Showing context related FAQ list for each page
Features and limitations

#Place multiple widgets 
In the content you can place a microflow trigger, but don't use the close activitiy, because the page of the widget will closed, instead of the page where the user is on.

#Dependencies

Mendix 6.6.0 and higher (built and tested)

#Installation

Download the widget from the appstore and place a variant on a page or layout.

#Configuration

Fill in the required properties of the widget.
A page needs to be made that holds the content. The best option is to use popup layout for the page, because the layout will be loaded too by Mendix.

#Known bugs

Not known at the moment
>>>>>>> 1f6ceceab4d62129a0b4497e7f76ca24723ef4ce
