# encoding: UTF-8
class Widget < ActiveJSON::Base

  set_root_path 'config/json'
  set_filename  'widgets'

  def self.find_widgets(filters)
    default_widgets     = filters[:default]['true']  if filters[:default].present?
    not_default_widgets = filters[:default]['false'] if filters[:default].present?

    widgets = if default_widgets.present?
                self.where(default: true)
              elsif not_default_widgets.present?
                self.where(default: false)
              else
                self.all
              end
  end

  def data_url(collection, id, params)
    country = params[:iso]
    region  = params[:id_1]
    thresh  = params[:thresh]

    url =  "/api/#{ collection }/#{ id }"
    url += "/#{ country }"       if country.present?
    url += "/#{ region }"        if region.present?
    url += "?thresh=#{ thresh }" if thresh.present?

    url.to_s
  end

end
