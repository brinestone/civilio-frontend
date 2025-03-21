package fr.civipol.civilio.beans;

import javafx.fxml.FXMLLoader;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.*;

@Configuration
@ComponentScans({
        @ComponentScan("fr.civipol.civilio.stage"),
        @ComponentScan("fr.civipol.civilio.services"),
        @ComponentScan("fr.civipol.civilio.controller"),
})
@PropertySources({
        @PropertySource("classpath:/application.properties")
})
public class SpringConfig {

    @Bean
    @Scope("prototype")
    public FXMLLoader fxmlLoader(ApplicationContext applicationContext) {
        final var loader = new FXMLLoader();
        loader.setControllerFactory(applicationContext::getBean);
        return loader;
    }
}
