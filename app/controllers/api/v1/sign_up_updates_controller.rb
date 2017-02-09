require "google_drive"

module Api::V1
  class SignUpUpdatesController < BaseControllerV1
    skip_before_action :verify_authenticity_token, only: [:create]

    def create
      # https://github.com/gimite/google-drive-ruby/blob/master/doc/authorization.md
      config = File.read(File.join(Rails.root, 'config', 'gdrive.json.erb'))
      config = ERB.new(config).result(binding)
      session = GoogleDrive::Session.from_service_account_key(StringIO.new(config))

      sheet = session.spreadsheet_by_key(ENV["SPREADSHEETS_ID"]).worksheets[0]

      response = {}
      if already_added(sheet)
        response = { success: false, msg: 'Already added' }
      elsif add_new_email(sheet)
        response = { success: true, msg: 'Email added' }
      else
        response = { success: false, msg: 'Unable to save the email' }
      end

      render :json => response
    end

    private
      def filter_params
        params.permit(:email)
      end

      def already_added(sheet)
        sheet.rows.each do |row|
          if row[0] == params[:email]
            return true
          end
        end
        return false
      end

      def add_new_email(sheet)
        # Get last available row
        row = 1 + sheet.num_rows

        # Write the email and save it
        sheet[row, 1] = params[:email]
        sheet.save

        # Reloads the worksheet to get changes by other clients.
        sheet.reload
      end
  end
end
