package com.example.demo.vo;



// lombok 은 쓰지 않겠습니다!
public class User_vo {
    private Long id ;
    private String name ; 
    private String email ; 
    private String login_provider ;
    private String provider_uid;
    private String profile_emoji ;
    private int is_dark_mode ;
    private String status ;
    private String withdrawn_at ;
    private String created_at ; 
    private String updated_at ;



    public User_vo() {
    }
    
    public User_vo(Long id, String name, String email, String login_provider, String provider_uid, String profile_emoji, int is_dark_mode, String status, String withdrawn_at, String created_at, String updated_at) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.login_provider = login_provider;
        this.provider_uid = provider_uid;
        this.profile_emoji = profile_emoji;
        this.is_dark_mode = is_dark_mode;
        this.status = status;
        this.withdrawn_at = withdrawn_at;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }



    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getLogin_provider() {
        return login_provider;
    }

    public void setLogin_provider(String login_provider) {
        this.login_provider = login_provider;
    }

    public String getProvider_uid() {
        return provider_uid;
    }

    public void setProvider_uid(String provider_uid) {
        this.provider_uid = provider_uid;
    }

    public String getProfile_emoji() {
        return profile_emoji;
    }

    public void setProfile_emoji(String profile_emoji) {
        this.profile_emoji = profile_emoji;
    }

    public int getIs_dark_mode() {
        return is_dark_mode;
    }

    public void setIs_dark_mode(int is_dark_mode) {
        this.is_dark_mode = is_dark_mode;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
    
    public String getWithdrawn_at() {
        return withdrawn_at;
    }

    public void setWithdrawn_at(String withdrawn_at) {
        this.withdrawn_at = withdrawn_at;
    }

    public String getCreated_at() {
        return created_at;
    }

    public void setCreated_at(String created_at) {
        this.created_at = created_at;
    }

    
    public String getUpdated_at() {
        return updated_at;
    }

    public void setUpdated_at(String updated_at) {
        this.updated_at = updated_at;
    }


    
}
